export type DocumentType = 'CC' | 'TI' | 'CE' | 'PA' | 'PPT';

export const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'CC', label: 'Cédula de ciudadanía' },
  { value: 'TI', label: 'Tarjeta de identidad' },
  { value: 'CE', label: 'Cédula de extranjería' },
  { value: 'PA', label: 'Pasaporte' },
  { value: 'PPT', label: 'Permiso por protección temporal' }
];

/** Datos básicos para identificar y contactar a una persona asistente. */
export interface RegistrationData {
  documentType: DocumentType;
  documentNumber: string;
  firstNames: string;
  lastNames: string;
  email: string;
  phone: string;
}

/** Evento con aprobación completa y su ocupación de cupos. */
export interface RegistrationEvent {
  id: number;
  name: string;
  eventType: string;
  faculty: string;
  modality: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  minimumCapacity: number;
  maximumCapacity: number;
  registeredCount: number;
  availableSlots: number;
}

export interface Registration extends RegistrationData {
  id: number;
  position: number;
  source: 'formulario' | 'excel';
  createdAt: string;
}

/** Persona que ocupó el último cupo del evento. */
export interface LastSlot extends RegistrationData {
  position: number;
  rowNumber: number | null;
}

export interface EventRegistrations {
  event: RegistrationEvent;
  registrations: Registration[];
}

export interface RegisterResult {
  registration: Registration;
  event: RegistrationEvent;
  capacityReached: boolean;
  lastSlot: LastSlot | null;
}

export interface ImportResult {
  totalRows: number;
  registered: number;
  failed: number;
  failedByCapacity: number;
  event: RegistrationEvent;
  capacityReached: boolean;
  lastSlot: LastSlot | null;
  failedFile: { fileName: string; contentBase64: string } | null;
}
