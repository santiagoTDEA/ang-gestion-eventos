import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub: string;
  exp: number;
  role: {
    permissionsFull: boolean;
    modulesFull: boolean;
    accesos: Array<{
      module: string;
      acciones: string[];
    }>;
  };
}
@Injectable({
  providedIn: 'root'
})
export class JwtService {
  private role: DecodedToken['role'] | null = null;

  validarToken(token: string): DecodedToken | null {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const expiration = decoded.exp;

      if (
        typeof expiration !== 'number' ||
        !Number.isFinite(expiration) ||
        expiration * 1000 <= Date.now()
      ) {
        return null;
      }

      if (
        typeof decoded.sub !== 'string' ||
        !decoded.sub.trim() ||
        !decoded.role ||
        typeof decoded.role !== 'object'
      ) {
        return null;
      }

      return decoded;
    } catch {
      return null;
    }
  }

  esTokenValido(token: string): boolean {
    return this.validarToken(token) !== null;
  }

  tieneAccesoAlModulo(token: string, module: string): boolean {
    const role = this.cargarDesdeToken(token);
    if (!role) {
      return false;
    }

    if (role.modulesFull) {
      return true;
    }

    const normalizedModule = module.trim().toLowerCase();
    return role.accesos?.some(
      acceso => acceso.module?.trim().toLowerCase() === normalizedModule
    ) ?? false;
  }

  /** Id del usuario autenticado (claim sub del token). */
  obtenerUserId(token: string): string | null {
    try {
      return jwtDecode<DecodedToken>(token).sub ?? null;
    } catch {
      return null;
    }
  }

  cargarDesdeToken(token: string): DecodedToken['role'] | null {
    const decoded = this.validarToken(token);
    this.role = decoded?.role ?? null;
    return this.role;
  }

  limpiar(): void {
    this.role = null;
  }
}
