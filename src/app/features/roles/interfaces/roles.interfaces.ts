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