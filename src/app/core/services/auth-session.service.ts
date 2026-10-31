import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { JwtService } from './jwt.service';
import { PermissionService } from './permission.service';

@Injectable({
  providedIn: 'root'
})
export class AuthSessionService {
  private readonly router = inject(Router);
  private readonly jwtService = inject(JwtService);
  private readonly permissionService = inject(PermissionService);

  cerrarSesion(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('loggedInUsername');
    this.jwtService.limpiar();
    this.permissionService.clearRole();
    this.router.navigate(['/'], { replaceUrl: true });
  }
}
