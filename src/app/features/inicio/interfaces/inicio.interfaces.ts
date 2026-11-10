

export interface Access {
  modulo: string;
  acciones: string[];
}

export interface Role {
  name?: string;
  permissionsFull?: boolean;
  modulesFull?: boolean;
  accesos?: Access[];
}