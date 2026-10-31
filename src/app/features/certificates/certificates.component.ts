import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  inject
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CertificatesService } from './services/certificates.service';
import {
  CERTIFICATE_RENDER_PX,
  CertificateJob,
  CertificatePdfService,
  GenerationCancelledError,
  PdfOutput
} from './services/certificate-pdf.service';
import {
  CertificateData,
  CertificateEvent,
  CertificateParticipant,
  CertificateSigner
} from './interfaces/certificates.interfaces';
import { certificateFileName, eventDateText, eventFileName, uniqueFileNames } from './utils/certificate-text';
import { CertificateTemplateComponent } from './components/certificate-template/certificate-template.component';
import { ValidateRenderingService } from '../inicio/services/validate-rendering.service';
import { GenericAlertComponent } from '../../../shared/atoms/generic-alert/generic-alert.component';
import { GenericAlertResponse } from '../../../shared/atoms/generic-alert/utils/style';

type Scope = 'todos' | 'persona';

/** Datos de la plantilla que no vienen del evento; se recuerdan en este navegador. */
interface StoredSettings {
  city: string;
  signers: CertificateSigner[];
}

const SETTINGS_KEY = 'certificados.plantilla';
const MAX_SIGNATURE_BYTES = 1024 * 1024;

/** Espera a que carguen las imágenes (logo y firmas) antes de capturar la plantilla. */
async function waitForImages(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll('img'));
  await Promise.all(images.map(image => image.decode().catch(() => undefined)));
}

@Component({
  selector: 'app-certificates',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, GenericAlertComponent, CertificateTemplateComponent],
  templateUrl: './certificates.component.html',
  styleUrl: './certificates.component.css',
  // Las reglas de impresión ocultan el menú y la barra superior de la aplicación.
  encapsulation: ViewEncapsulation.None
})
export class CertificatesComponent implements OnInit, OnDestroy {
  private readonly certificatesService = inject(CertificatesService);
  private readonly pdfService = inject(CertificatePdfService);
  private readonly validateRenderingService = inject(ValidateRenderingService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  /** Contenedor fuera de la vista donde se dibuja cada certificado antes de pasarlo a PDF. */
  @ViewChild('renderHost') private renderHost?: ElementRef<HTMLElement>;

  readonly acceso = this.validateRenderingService.permisosDelModulo('certificados');
  readonly renderSize = CERTIFICATE_RENDER_PX;

  events: CertificateEvent[] = [];
  participants: CertificateParticipant[] = [];
  loadingEvents = false;
  loadingParticipants = false;
  /** Mientras es true se dibujan todos los certificados para el diálogo de impresión. */
  printing = false;

  /** Certificado que se está dibujando para capturarlo. */
  renderData: CertificateData | null = null;
  /** Avance de la generación de PDF; null cuando no se está generando. */
  progress: { done: number; total: number } | null = null;
  private abortController: AbortController | null = null;

  readonly eventControl = new FormControl<number | null>(null);
  /** Con "todos": un solo PDF con todas las hojas o un PDF por persona dentro de un ZIP. */
  readonly outputControl = new FormControl<PdfOutput>('combined', { nonNullable: true });
  readonly scopeControl = new FormControl<Scope>('todos', { nonNullable: true });
  readonly participantControl = new FormControl<number | null>(null);

  readonly settingsForm = this.fb.nonNullable.group({
    city: ['Medellín', [Validators.required, Validators.maxLength(60)]],
    signers: this.fb.nonNullable.array([this.createSigner(), this.createSigner()])
  });
  signatures: (string | null)[] = [null, null];

  alertaResponse: GenericAlertResponse = {
    alertVisible: false,
    alertType: 'success',
    alertTitle: '',
    alertMessage: ''
  };

  ngOnInit(): void {
    if (!this.acceso.canView) {
      this.router.navigate(['/inicio']);
      return;
    }

    this.restoreSettings();
    this.settingsForm.valueChanges.subscribe(() => this.saveSettings());
    this.eventControl.valueChanges.subscribe(eventId => this.onEventChange(eventId));
    this.loadEvents();
  }

  get signersArray() {
    return this.settingsForm.controls.signers;
  }

  get selectedEvent(): CertificateEvent | null {
    return this.events.find(event => event.id === this.eventControl.value) ?? null;
  }

  /** En los eventos virtuales el certificado no menciona ciudad. */
  get isVirtual(): boolean {
    return this.selectedEvent?.modality.toLowerCase() === 'virtual';
  }

  /** Personas a las que se les genera el certificado según la opción escogida. */
  get selectedParticipants(): CertificateParticipant[] {
    if (this.scopeControl.value === 'todos') return this.participants;

    const participant = this.participants.find(item => item.id === this.participantControl.value);
    return participant ? [participant] : [];
  }

  /** Certificado de muestra: la persona escogida o, con "todos", la primera de la lista. */
  get previewData(): CertificateData | null {
    const participant = this.selectedParticipants[0];
    return participant ? this.buildData(participant) : null;
  }

  get certificates(): CertificateData[] {
    return this.selectedParticipants.map(participant => this.buildData(participant));
  }

  setScope(scope: Scope): void {
    this.scopeControl.setValue(scope);
    if (scope === 'todos') this.participantControl.setValue(null);
  }

  onSignatureSelected(index: number, input: HTMLInputElement): void {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      this.showAlert('error', 'Firma no válida', 'La firma debe ser una imagen PNG, JPG o WEBP (ideal con fondo transparente).');
      return;
    }
    if (file.size > MAX_SIGNATURE_BYTES) {
      this.showAlert('error', 'Firma muy pesada', 'La imagen de la firma no puede pasar de 1 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.signatures[index] = reader.result as string;
      this.saveSettings();
    };
    reader.readAsDataURL(file);
  }

  removeSignature(index: number): void {
    this.signatures[index] = null;
    this.saveSettings();
  }

  get generating(): boolean {
    return this.progress !== null;
  }

  /** Con una sola persona siempre sale un PDF; con "todos" depende del formato escogido. */
  get effectiveOutput(): PdfOutput {
    return this.selectedParticipants.length > 1 ? this.outputControl.value : 'combined';
  }

  get downloadLabel(): string {
    const total = this.selectedParticipants.length;
    if (total <= 1) return 'Descargar PDF';
    return this.effectiveOutput === 'separate' ? `Descargar ZIP (${total} PDF)` : `Descargar PDF (${total} hojas)`;
  }

  get progressPercent(): number {
    return this.progress ? Math.round((this.progress.done / this.progress.total) * 100) : 0;
  }

  /** Genera los certificados como archivo(s) PDF y los descarga directamente. */
  async download(): Promise<void> {
    const event = this.selectedEvent;
    if (!event || this.generating || !this.canGenerate()) return;

    const participants = this.selectedParticipants;
    const fileNames = uniqueFileNames(participants.map(participant => certificateFileName(participant)));
    const jobs: CertificateJob<CertificateData>[] = participants.map((participant, index) => ({
      data: this.buildData(participant),
      fileName: fileNames[index]
    }));

    this.abortController = new AbortController();
    this.progress = { done: 0, total: jobs.length };
    this.setLocked(true);

    try {
      const file = await this.pdfService.generate({
        jobs,
        output: this.effectiveOutput,
        bundleName: eventFileName(event.name),
        title: `Certificados · ${event.name}`,
        render: data => this.renderCertificate(data),
        onProgress: (done, total) => (this.progress = { done, total }),
        signal: this.abortController.signal
      });

      this.pdfService.download(file);
      this.showAlert('success', 'Certificados listos',
        jobs.length === 1
          ? `Se descargó ${file.fileName}.`
          : this.effectiveOutput === 'separate'
            ? `Se descargó un ZIP con ${jobs.length} PDF, uno por persona.`
            : `Se descargó un PDF con ${jobs.length} certificados, uno por hoja.`);
    } catch (error) {
      if (error instanceof GenerationCancelledError) {
        this.showAlert('info', 'Generación cancelada', 'No se descargó ningún archivo.');
      } else {
        console.error(error);
        this.showAlert('error', 'No se pudieron generar los certificados',
          'Intenta de nuevo. Si el problema sigue, revisa que las imágenes de las firmas sean PNG o JPG válidos.');
      }
    } finally {
      this.progress = null;
      this.renderData = null;
      this.abortController = null;
      this.setLocked(false);
    }
  }

  cancelGeneration(): void {
    this.abortController?.abort();
  }

  /** Abre el diálogo de impresión con un certificado por hoja. */
  print(): void {
    if (this.generating || !this.canGenerate()) return;

    this.printing = true;
    // Se espera a que Angular dibuje los certificados antes de abrir el diálogo.
    setTimeout(() => window.print(), 300);
  }

  @HostListener('window:afterprint')
  onAfterPrint(): void {
    this.printing = false;
  }

  ngOnDestroy(): void {
    this.cancelGeneration();
  }

  goBack(): void {
    this.router.navigate(['/inicio']);
  }

  /** Mientras se generan los PDF no se puede cambiar el evento, la persona ni la plantilla. */
  private setLocked(locked: boolean): void {
    const controls = [this.eventControl, this.scopeControl, this.participantControl, this.outputControl, this.settingsForm];
    controls.forEach(control => (locked ? control.disable({ emitEvent: false }) : control.enable({ emitEvent: false })));
  }

  /** Revisa que haya a quién certificar y que la plantilla tenga todos sus datos. */
  private canGenerate(): boolean {
    if (!this.selectedEvent || this.selectedParticipants.length === 0) {
      this.showAlert('warning', 'Falta escoger a quién certificar',
        this.scopeControl.value === 'persona' ? 'Selecciona la persona.' : 'El evento no tiene personas inscritas.');
      return false;
    }

    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      this.showAlert('warning', 'Faltan datos de la plantilla', 'Escribe la ciudad y el nombre y cargo de los dos firmantes.');
      return false;
    }

    return true;
  }

  /** Dibuja un certificado en el contenedor oculto y lo devuelve listo para capturar. */
  private async renderCertificate(data: CertificateData): Promise<HTMLElement> {
    this.renderData = data;
    this.cdr.detectChanges();

    const host = this.renderHost?.nativeElement;
    const certificate = host?.querySelector<HTMLElement>('.certificado');
    if (!host || !certificate) {
      throw new Error('No se pudo dibujar la plantilla del certificado.');
    }

    await waitForImages(host);
    return certificate;
  }

  private buildData(participant: CertificateParticipant): CertificateData {
    const event = this.selectedEvent!;
    const { city, signers } = this.settingsForm.getRawValue();
    const date = eventDateText(event.startDate, event.endDate);
    const place = this.isVirtual
      ? 'Realizado de manera virtual'
      : `Realizado en la ciudad de ${city.trim()}`;

    return {
      fullName: participant.fullName,
      documentNumber: participant.documentNumber,
      eventType: event.eventType,
      eventName: event.name,
      placeAndDate: `${place}, ${date}`,
      duration: event.duration,
      signers: signers.map((signer, index) => ({
        name: signer.name.trim(),
        role: signer.role.trim(),
        signature: this.signatures[index]
      }))
    };
  }

  private onEventChange(eventId: number | null): void {
    this.participants = [];
    this.setScope('todos');

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { evento: eventId ?? null },
      replaceUrl: true
    });

    if (!eventId) return;

    const event = this.selectedEvent;
    if (event) this.suggestDeanRole(event.faculty);

    this.loadingParticipants = true;
    this.certificatesService.getByEvent(eventId).subscribe({
      next: ({ participants }) => {
        this.loadingParticipants = false;
        if (this.eventControl.value === eventId) this.participants = participants;
      },
      error: err => {
        this.loadingParticipants = false;
        this.fail(err, 'No se pudieron cargar los inscritos');
      }
    });
  }

  /** El segundo firmante es el decano de la facultad del evento, si no se escribió otro cargo. */
  private suggestDeanRole(faculty: string): void {
    const role = this.signersArray.at(1).controls.role;
    if (role.value && !role.value.startsWith('Decano')) return;

    const name = faculty.trim();
    role.setValue(`Decano ${/^facultad/i.test(name) ? name : `Facultad de ${name}`}`);
  }

  private loadEvents(): void {
    this.loadingEvents = true;
    this.certificatesService.getEvents().subscribe({
      next: events => {
        this.events = events;
        this.loadingEvents = false;

        const eventId = Number(this.route.snapshot.queryParamMap.get('evento'));
        if (events.some(event => event.id === eventId)) {
          this.eventControl.setValue(eventId);
        }
      },
      error: err => {
        this.loadingEvents = false;
        this.fail(err, 'No se pudieron cargar los eventos');
      }
    });
  }

  private createSigner() {
    return this.fb.nonNullable.group({
      name: ['', [Validators.required, Validators.maxLength(80)]],
      role: ['', [Validators.required, Validators.maxLength(80)]]
    });
  }

  private restoreSettings(): void {
    try {
      const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? 'null') as StoredSettings | null;
      if (!stored) {
        this.signersArray.at(0).controls.role.setValue('Directora de Extensión Académica');
        return;
      }

      this.settingsForm.patchValue({
        city: stored.city,
        signers: stored.signers.map(({ name, role }) => ({ name, role }))
      }, { emitEvent: false });
      this.signatures = stored.signers.map(signer => signer.signature ?? null);
    } catch {
      // Sin datos guardados: se usan los valores por defecto.
    }
  }

  private saveSettings(): void {
    const { city, signers } = this.settingsForm.getRawValue();
    const settings: StoredSettings = {
      city,
      signers: signers.map((signer, index) => ({ ...signer, signature: this.signatures[index] }))
    };

    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // Si el navegador no deja guardar, la plantilla igual funciona en esta sesión.
    }
  }

  private fail(err: { error?: { message?: string | string[] } }, title: string): void {
    const message = err?.error?.message;
    this.showAlert('error', title, Array.isArray(message) ? message.join(' ') : (message ?? 'Ocurrió un error inesperado.'));
  }

  private showAlert(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string): void {
    this.alertaResponse = { alertVisible: true, alertType: type, alertTitle: title, alertMessage: message };
  }
}
