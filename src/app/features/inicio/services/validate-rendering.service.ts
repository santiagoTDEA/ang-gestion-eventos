import { Injectable } from '@angular/core';
import { Role } from '../interfaces/inicio.interfaces';
import { ModuleOption } from '../../roles/interfaces/roles.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ValidateRenderingService {

  validateRendering(permission: Role | null, modulos: ModuleOption[]): ModuleOption[] {
    if (!permission) return [];

    if (permission.permissionsFull && permission.modulesFull) return modulos;

    return modulos.filter(modulo => permission.accesos?.some(acceso => acceso.modulo === modulo.value)) ?? [];
  }
}
