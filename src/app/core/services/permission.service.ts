import { Injectable } from '@angular/core';
export interface Permission {
  module: string;
  action: string;
}

export interface Access {
  module: string;
  acciones: string[];
}

export interface Role {
  permissionsFull?: boolean;
  modulesFull?: boolean;
  accesos?: Access[];
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  private role: Role | null = null;

  setRole(role: Role): void {
    this.role = role;
  }

  clearRole(): void {
    this.role = null;
  }

  hasPermission(permission: Permission): boolean {
    if (!this.role) {
      return false;
    }


    if (this.role.permissionsFull && this.role.modulesFull) {
      return true;
    }


    const acceso = this.role.accesos?.find(
      (item) => item.module === permission.module,
    );

    if (!acceso) {
      return false;
    }


    if (this.role.permissionsFull) {
      return true;
    }


    return acceso.acciones?.includes(permission.action) ?? false;
  }

  hasModule(module: string): boolean {
    if (!this.role) {
      return false;
    }

    if (this.role.modulesFull) {
      return true;
    }

    return this.role.accesos?.some(
      (acceso) => acceso.module === module,
    ) ?? false;
  }
}
