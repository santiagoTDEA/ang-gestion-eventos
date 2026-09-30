// Estados posibles del flujo de aprobación
export type ApprovalStatus = 'pending' | 'in_progress' | 'approved' | 'rejected' | 'returned';

// Roles en la cadena de aprobación
export type ApprovalRole = 'elaboracion' | 'revision' | 'verificacion' | 'validacion';

// Firma híbrida (texto + imagen)
export interface Signature {
  type: 'text' | 'image' | 'both';
  text?: string;
  imageUrl?: string;
}

// Registro de aprobación individual
export interface ApprovalStep {
  id: string;
  role: ApprovalRole;
  roleTitle: string;
  roleDescription: string;
  status: ApprovalStatus;
  approverName?: string;
  approverRole?: string;
  date?: string;
  signature?: Signature;
  observations?: string;
  rejectionReason?: string;
  rejectionType?: 'return' | 'full';
}

// Flujo completo de aprobación
export interface ApprovalFlow {
  id: string;
  eventId: string;
  eventName: string;
  currentStep: number;
  steps: ApprovalStep[];
  createdAt: string;
  updatedAt: string;
}

// DTO para enviar aprobación
export interface ApproveDto {
  stepId: string;
  signature: Signature;
  observations?: string;
}

// DTO para rechazar
export interface RejectDto {
  stepId: string;
  rejectionType: 'return' | 'full';
  reason: string;
}

// Respuesta del servicio
export interface ApprovalResponse {
  success: boolean;
  message: string;
  data?: ApprovalFlow;
}