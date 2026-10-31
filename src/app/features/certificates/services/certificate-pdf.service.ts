import { Injectable } from '@angular/core';

/** Ancho y alto de una hoja A4 horizontal en milímetros. */
const PAGE_MM = { width: 297, height: 210 };

/** La plantilla se dibuja a este tamaño (A4 a 96 ppp) y se captura al doble de resolución (~190 ppp). */
export const CERTIFICATE_RENDER_PX = { width: 1123, height: 794 };
const PIXEL_RATIO = 2;
const JPEG_QUALITY = 0.92;

export type PdfOutput = 'combined' | 'separate';

/** Un certificado a generar: cómo dibujarlo y con qué nombre guardarlo. */
export interface CertificateJob<T> {
  data: T;
  fileName: string;
}

export interface GeneratedFile {
  blob: Blob;
  fileName: string;
}

export interface GenerateOptions<T> {
  jobs: CertificateJob<T>[];
  output: PdfOutput;
  /** Nombre del PDF combinado o del ZIP, sin extensión. */
  bundleName: string;
  title: string;
  /** Dibuja la plantilla con los datos y devuelve el elemento listo para capturar. */
  render: (data: T) => Promise<HTMLElement>;
  onProgress?: (done: number, total: number) => void;
  signal?: AbortSignal;
}

/** Se lanza cuando el usuario cancela la generación. */
export class GenerationCancelledError extends Error {
  constructor() {
    super('Generación cancelada');
    this.name = 'GenerationCancelledError';
  }
}

/**
 * Convierte la plantilla del certificado en PDF dentro del navegador: no usa el
 * servidor ni dependencias nativas. Las librerías se cargan solo cuando se usan.
 */
@Injectable({
  providedIn: 'root'
})
export class CertificatePdfService {
  async generate<T>(options: GenerateOptions<T>): Promise<GeneratedFile> {
    const { jobs, output, bundleName, title, render, onProgress, signal } = options;

    if (jobs.length === 0) {
      throw new Error('No hay certificados para generar.');
    }

    const [{ jsPDF }, { toJpeg }] = await Promise.all([import('jspdf'), import('html-to-image')]);
    const createPdf = (subject: string) => {
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
      pdf.setProperties({ title, subject, creator: 'Gestión de Eventos · TdeA' });
      return pdf;
    };

    const capture = async (data: T): Promise<string> => {
      const element = await render(data);
      return toJpeg(element, {
        quality: JPEG_QUALITY,
        pixelRatio: PIXEL_RATIO,
        width: CERTIFICATE_RENDER_PX.width,
        height: CERTIFICATE_RENDER_PX.height,
        backgroundColor: '#ffffff',
        // La plantilla usa fuentes del sistema; así no intenta descargar las de otras hojas de estilo.
        skipFonts: true
      });
    };

    const addPage = (pdf: InstanceType<typeof jsPDF>, image: string) =>
      pdf.addImage(image, 'JPEG', 0, 0, PAGE_MM.width, PAGE_MM.height, undefined, 'FAST');

    if (output === 'combined' || jobs.length === 1) {
      const pdf = createPdf(title);

      for (const [index, job] of jobs.entries()) {
        await this.checkpoint(signal);
        if (index > 0) pdf.addPage('a4', 'landscape');
        addPage(pdf, await capture(job.data));
        onProgress?.(index + 1, jobs.length);
      }

      return {
        blob: pdf.output('blob'),
        fileName: jobs.length === 1 ? jobs[0].fileName : `${bundleName}.pdf`
      };
    }

    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();

    for (const [index, job] of jobs.entries()) {
      await this.checkpoint(signal);
      const pdf = createPdf(job.fileName.replace(/\.pdf$/i, ''));
      addPage(pdf, await capture(job.data));
      zip.file(job.fileName, pdf.output('arraybuffer'));
      onProgress?.(index + 1, jobs.length);
    }

    await this.checkpoint(signal);
    // Los PDF ya van comprimidos (JPEG): comprimirlos otra vez solo gasta tiempo.
    const blob = await zip.generateAsync({ type: 'blob', compression: 'STORE', mimeType: 'application/zip' });

    return { blob, fileName: `${bundleName}.zip` };
  }

  /** Descarga un archivo generado en el navegador. */
  download({ blob, fileName }: GeneratedFile): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    // Se libera después: algunos navegadores leen la URL justo después del clic.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /** Cede el hilo para que la barra de progreso se pinte y revisa si se canceló. */
  private async checkpoint(signal?: AbortSignal): Promise<void> {
    await new Promise(resolve => setTimeout(resolve));
    if (signal?.aborted) throw new GenerationCancelledError();
  }
}
