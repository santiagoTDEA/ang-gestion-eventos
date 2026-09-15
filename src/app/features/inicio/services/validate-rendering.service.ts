import { Injectable } from '@angular/core';
import { Role, Modulo } from '../interfaces/inicio.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ValidateRenderingService {

  validateRendering(permission: Role | null, modulos: Modulo[]): Modulo[] {
    if (!permission) return [];

    if (permission.permissionsFull && permission.modulesFull) return modulos;

    return modulos.filter(modulo => permission.accesos?.some(acceso => acceso.modulo === modulo.nombre)) ?? [];
  }
}
