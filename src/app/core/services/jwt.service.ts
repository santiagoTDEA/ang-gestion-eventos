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

  cargarDesdeToken(token: string): DecodedToken['role'] | null {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      this.role = decoded.role;
      return this.role;
    } catch (error) {
      console.error('Token inválido:', error);
      this.role = null;
    }
    return this.role;
  }
}
