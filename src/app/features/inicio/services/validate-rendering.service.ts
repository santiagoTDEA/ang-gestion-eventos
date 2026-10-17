import { Injectable, inject } from '@angular/core';
import { JwtService } from '../../../core/services/jwt.service';
import { Role } from '../interfaces/inicio.interfaces';
import { ModuleOption } from '../../roles/interfaces/roles.interfaces';
export type NivelAcceso = 'all' | 'view' | 'write' | 'update' | 'none';

/** Qué puede hacer el usuario en un módulo, derivado de su nivel de acceso. */
export interface PermisosModulo {
  nivel: NivelAcceso;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ValidateRenderingService {
  private readonly jwtService = inject(JwtService);


  validateRendering(permission: Role | null, modulos: ModuleOption[]): ModuleOption[] {
    if (!permission) return [];

    if (permission.permissionsFull && permission.modulesFull) return modulos;

    return modulos.filter(modulo => permission.accesos?.some(acceso => acceso.modulo === modulo.value)) ?? [];
  }



  /** Permisos del usuario autenticado (token) sobre un módulo; sirve para cualquier pantalla. */
  permisosDelModulo(modulo: string): PermisosModulo {
    const token = localStorage.getItem('accessToken');
    const rol = token ? (this.jwtService.cargarDesdeToken(token) as Role | null) : null;
    const nivel = this.devolverAccesosPermitidos(modulo, rol);

    return {
      nivel,
      canView: nivel === 'all' || nivel === 'update' || nivel === 'view',
      canCreate: nivel === 'all' || nivel === 'write',
      canEdit: nivel === 'all' || nivel === 'update',
    };
  }

  devolverAccesosPermitidos(
    modulo: string ,
    permission: Role | null
  ): NivelAcceso {
    if (!permission) return 'none';
    if (permission?.permissionsFull && permission?.modulesFull) return 'all';
    const acciones =
      permission?.accesos?.find(a => a.modulo === modulo)?.acciones ?? [];

    // Jerarquía: cada permiso incluye a los que están por debajo.
    //   crear  -> all    (CRUD completo)
    //   editar -> update (ve la tabla y puede abrir un registro para editarlo)
    //   leer   -> view   (ve la tabla, sin edición)
    if (acciones.includes('crear')) return 'all';
    if (acciones.includes('editar')) return 'update';
    if (acciones.includes('leer')) return 'view';
    return 'none';
  }

}
