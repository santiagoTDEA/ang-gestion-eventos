

export interface Access {
  modulo: string;
  acciones: string[];
}

export interface Role {
  permissionsFull?: boolean;
  modulesFull?: boolean;
  accesos?: Access[];
}