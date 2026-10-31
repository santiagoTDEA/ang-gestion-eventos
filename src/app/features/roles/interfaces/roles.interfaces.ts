export interface Access {
    modulo: string;
    acciones: string[];
}

export interface Role {
    name: string;
    description: string;
    permissionsFull: boolean;
    modulesFull: boolean;
    accesos: Access[];
    isActive: boolean;
}

export interface ModuleOption {
    value: string;
    label: string;
    icono: string;
    /** Solo lo ven los roles con permisos y módulos completos; no se asigna por accesos. */
    soloAccesoTotal?: boolean;
}

export interface ReturnRole {
  id: string;
  name: string;
  description: string;
  permissionsFull: boolean;
  modulesFull: boolean;
  accesos: Access[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}