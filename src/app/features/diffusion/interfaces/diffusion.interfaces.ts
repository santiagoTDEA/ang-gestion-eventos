export type DiffusionStatus = 'solicitada' | 'en_diseno' | 'en_revision' | 'publicada';

export type DiffusionAssetType = 'flyer' | 'video' | 'banner' | 'historias' | 'correos';

export interface DiffusionAction {
  to: DiffusionStatus;
  label: string;
  requiresNote: boolean;
}

export interface DiffusionAsset {
  id: number;
  assetType: DiffusionAssetType;
  originalName: string;
  /** Ruta pública relativa; se concatena con la URL de archivos del backend. */
  path: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface DiffusionHistoryItem {
  id: number;
  fromStatus: DiffusionStatus | null;
  toStatus: DiffusionStatus;
  changedByName: string;
  note: string | null;
  createdAt: string;
}

export interface DiffusionRequest {
  id: number;
  eventId: number;
  eventName: string;
  type: 'piezas' | 'difusion';
  area: 'comunicaciones' | 'produccion_medios';
  areaLabel: string;
  status: DiffusionStatus;
  eventSnapshot: {
    name: string;
    eventType: string;
    faculty: string;
    modality: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    participantProfile: string;
    presentation: string;
  };
  allowedAssetTypes: DiffusionAssetType[];
  allowedActions: DiffusionAction[];
  canUpload: boolean;
  assets: DiffusionAsset[];
  history: DiffusionHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

/** Orden de los estados para pintar el progreso. */
export const DIFFUSION_STATUSES: { value: DiffusionStatus; label: string }[] = [
  { value: 'solicitada', label: 'Solicitada' },
  { value: 'en_diseno', label: 'En diseño' },
  { value: 'en_revision', label: 'En revisión' },
  { value: 'publicada', label: 'Publicada' },
];

export const DIFFUSION_TYPE_LABEL: Record<DiffusionRequest['type'], string> = {
  piezas: 'Piezas publicitarias',
  difusion: 'Difusión'
};

export const DIFFUSION_ASSET_LABEL: Record<DiffusionAssetType, string> = {
  flyer: 'Flyer',
  video: 'Video promocional',
  banner: 'Banner',
  historias: 'Historias',
  correos: 'Correos de difusión'
};
