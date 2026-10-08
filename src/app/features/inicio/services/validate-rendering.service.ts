import { Injectable } from '@angular/core';
import { Role } from '../interfaces/inicio.interfaces';
import { ModuleOption } from '../../roles/interfaces/roles.interfaces';
export type NivelAcceso = 'all' | 'view' | 'write' | 'update' | 'none';

@Injectable({
  providedIn: 'root'
})
export class ValidateRenderingService {

  private readonly NIVELES: Record<string, NivelAcceso> = {
    '111': 'all',    // crear + leer + editar
    '010': 'view',   // solo leer
    '100': 'write',  // solo crear
    '001': 'update', // solo editar
  };
  validateRendering(permission: Role | null, modulos: ModuleOption[]): ModuleOption[] {
    if (!permission) return [];

    if (permission.permissionsFull && permission.modulesFull) return modulos;

    return modulos.filter(modulo => permission.accesos?.some(acceso => acceso.modulo === modulo.value)) ?? [];
  }



  devolverAccesosPermitidos(
    modulo: string ,
    permission: Role | null
  ): NivelAcceso {
    if (!permission) return 'none';
    if (permission?.permissionsFull && permission?.modulesFull) return 'all';
    const acciones =
      permission?.accesos?.find(a => a.modulo === modulo)?.acciones ?? [];

    const clave = ['crear', 'leer', 'editar']
      .map(p => Number(acciones.includes(p)))
      .join('');

    return this.NIVELES[clave] ?? 'none';
  }

}
