/** Estado de un paso para quien mira el flujo de un evento. */
export type StepState = 'approved' | 'current' | 'pending';

/** Pasos del workflow, en el orden en que se firman. */
export interface FlowStepMeta {
  key: string;
  roleName: string;
  title: string;
  description: string;
}

export const APPROVAL_FLOW: FlowStepMeta[] = [
  {
    key: 'elaboracion',
    roleName: 'Elaboración',
    title: 'Docente / Responsable',
    description: 'Persona que diligenció el formato.',
  },
  {
    key: 'revision',
    roleName: 'Revisión',
    title: 'Coordinador / Enlace',
    description: 'Enlace de Extensión, director o coordinador de la dependencia.',
  },
  {
    key: 'verificacion',
    roleName: 'Verificación',
    title: 'Equipo Educación Continua',
    description: 'Modalidad de Educación Continua.',
  },
  {
    key: 'validacion',
    roleName: 'Validación',
    title: 'Director de Extensión',
    description: 'Dirección de Extensión Académica.',
  },
];

/** Paso del workflow de un evento, ya combinado con su aprobación. */
export interface FlowStep extends FlowStepMeta {
  approvalId: number;
  state: StepState;
  personName: string;
  personEmail: string;
  signature: string;
  signedAt: string | null;
  /** El paso está asignado al usuario autenticado. */
  mine: boolean;
}
