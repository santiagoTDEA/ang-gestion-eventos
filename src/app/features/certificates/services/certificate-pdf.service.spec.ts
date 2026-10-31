import { TestBed } from '@angular/core/testing';
import JSZip from 'jszip';
import { CertificateTemplateComponent } from '../components/certificate-template/certificate-template.component';
import { CertificateData } from '../interfaces/certificates.interfaces';
import {
  CERTIFICATE_RENDER_PX,
  CertificateJob,
  CertificatePdfService,
  GenerationCancelledError
} from './certificate-pdf.service';

const sample = (fullName: string): CertificateData => ({
  fullName,
  documentNumber: '1038103291',
  eventType: 'Taller práctico',
  eventName: 'Power BI desde cero',
  placeAndDate: 'Realizado en la ciudad de Medellín, el 25 de noviembre de 2023',
  duration: 4,
  signers: [
    { name: 'Bertha Cecilia Rosero Melo', role: 'Directora de Extensión Académica', signature: null },
    { name: 'Andrés Felipe Montoya Rendon', role: 'Decano Facultad de Ingeniería', signature: null }
  ]
});

async function text(blob: Blob): Promise<string> {
  return new TextDecoder('latin1').decode(await blob.arrayBuffer());
}

describe('CertificatePdfService', () => {
  let service: CertificatePdfService;
  let host: HTMLElement;
  const rendered: string[] = [];

  /** Dibuja la plantilla real del certificado, como lo hace la pantalla. */
  const render = async (data: CertificateData): Promise<HTMLElement> => {
    const fixture = TestBed.createComponent(CertificateTemplateComponent);
    fixture.componentRef.setInput('data', data);
    fixture.detectChanges();
    host.replaceChildren(fixture.nativeElement);
    rendered.push(data.fullName);
    return (fixture.nativeElement as HTMLElement).querySelector('.certificado') as HTMLElement;
  };

  const jobs = (names: string[]): CertificateJob<CertificateData>[] =>
    names.map(name => ({ data: sample(name), fileName: `Certificado - ${name}.pdf` }));

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CertificateTemplateComponent] });
    service = TestBed.inject(CertificatePdfService);
    rendered.length = 0;
    host = document.createElement('div');
    host.style.cssText = `position:fixed;left:-10000px;top:0;width:${CERTIFICATE_RENDER_PX.width}px`;
    document.body.appendChild(host);
  });

  afterEach(() => host.remove());

  it('todos juntos: un PDF con una hoja A4 horizontal por persona', async () => {
    const progress: number[] = [];
    const file = await service.generate({
      jobs: jobs(['Ana Pérez', 'Luis Gómez', 'Yorbis Aragón']),
      output: 'combined',
      bundleName: 'Certificados - Power BI desde cero',
      title: 'Certificados',
      render,
      onProgress: done => progress.push(done)
    });

    const content = await text(file.blob);
    expect(file.fileName).toBe('Certificados - Power BI desde cero.pdf');
    expect(file.blob.type).toBe('application/pdf');
    expect(content.startsWith('%PDF-')).toBeTrue();
    expect(content).toContain('/Count 3');
    // Las 3 hojas son A4 horizontal: 841.89 x 595.28 puntos.
    const pages = Array.from(content.matchAll(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/g));
    expect(pages.length).toBe(3);
    pages.forEach(([, width, height]) => {
      expect(Number(width)).toBeCloseTo(841.89, 1);
      expect(Number(height)).toBeCloseTo(595.28, 1);
    });
    expect(progress).toEqual([1, 2, 3]);
    expect(rendered).toEqual(['Ana Pérez', 'Luis Gómez', 'Yorbis Aragón']);
  });

  it('separados: un ZIP con un PDF de una hoja por persona', async () => {
    const file = await service.generate({
      jobs: jobs(['Ana Pérez', 'Luis Gómez']),
      output: 'separate',
      bundleName: 'Certificados - Power BI desde cero',
      title: 'Certificados',
      render
    });

    expect(file.fileName).toBe('Certificados - Power BI desde cero.zip');
    const zip = await JSZip.loadAsync(await file.blob.arrayBuffer());
    const names = Object.keys(zip.files).sort();
    expect(names).toEqual(['Certificado - Ana Pérez.pdf', 'Certificado - Luis Gómez.pdf']);

    for (const name of names) {
      const pdf = await zip.file(name)!.async('string');
      expect(pdf.startsWith('%PDF-')).toBeTrue();
      expect(pdf).toContain('/Count 1');
    }
  });

  it('una sola persona: descarga su PDF con el nombre del certificado aunque pidan ZIP', async () => {
    const file = await service.generate({
      jobs: jobs(['Ana Pérez']),
      output: 'separate',
      bundleName: 'Certificados - Evento',
      title: 'Certificados',
      render
    });

    expect(file.fileName).toBe('Certificado - Ana Pérez.pdf');
    expect(file.blob.type).toBe('application/pdf');
  });

  it('la imagen capturada no sale en blanco (la plantilla sí se dibujó)', async () => {
    const element = await render(sample('Ana Pérez'));
    const { toCanvas } = await import('html-to-image');
    const canvas = await toCanvas(element, {
      width: CERTIFICATE_RENDER_PX.width,
      height: CERTIFICATE_RENDER_PX.height,
      backgroundColor: '#ffffff',
      skipFonts: true
    });

    const pixels = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
    let dark = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i] < 120 && pixels[i + 1] < 120 && pixels[i + 2] < 120) dark++;
    }
    // El texto oscuro (nombre, evento) ocupa una parte visible del certificado.
    expect(dark).toBeGreaterThan(2000);
  });

  it('se puede cancelar', async () => {
    const controller = new AbortController();
    controller.abort();

    await expectAsync(service.generate({
      jobs: jobs(['Ana Pérez', 'Luis Gómez']),
      output: 'combined',
      bundleName: 'x',
      title: 'x',
      render,
      signal: controller.signal
    })).toBeRejectedWithError(GenerationCancelledError);
    expect(rendered).toEqual([]);
  });

  it('sin personas no genera nada', async () => {
    await expectAsync(service.generate({
      jobs: [],
      output: 'combined',
      bundleName: 'x',
      title: 'x',
      render
    })).toBeRejected();
  });
});
