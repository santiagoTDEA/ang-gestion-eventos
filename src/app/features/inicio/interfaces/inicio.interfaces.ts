
export interface Modulo {
  nombre: string;
  icono: string;
}
export interface Access {
  modulo: string;
  acciones: string[];
}

export interface Role {
  permissionsFull?: boolean;
  modulesFull?: boolean;
  accesos?: Access[];
}