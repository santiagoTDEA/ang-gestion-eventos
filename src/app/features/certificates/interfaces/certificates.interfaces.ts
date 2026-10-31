/** Evento aprobado y finalizado que se puede certificar. */
export interface CertificateEvent {
  id: number;
  name: string;
  eventType: string;
  faculty: string;
  modality: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  endsAt: string;
  registeredCount: number;
}

export interface CertificateParticipant {
  id: number;
  documentType: string;
  documentNumber: string;
  fullName: string;
}

export interface EventCertificates {
  event: CertificateEvent;
  participants: CertificateParticipant[];
}

export interface CertificateSigner {
  name: string;
  role: string;
  /** Imagen de la firma (data URL); opcional. */
  signature: string | null;
}

/** Datos que reemplazan los campos de la plantilla del certificado. */
export interface CertificateData {
  fullName: string;
  documentNumber: string;
  eventType: string;
  eventName: string;
  /** "Realizado en la ciudad de Medellín, el 25 de noviembre de 2023" */
  placeAndDate: string;
  duration: number;
  signers: CertificateSigner[];
}
