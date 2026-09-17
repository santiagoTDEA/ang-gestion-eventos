export interface CreateStatusDto {
  statusName: string;
}

export interface UpdateStatusDto {
  statusName?: string;
}

export interface Status {
  idStatus: number;
  statusName: string;
}