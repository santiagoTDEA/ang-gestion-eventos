import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { JwtService } from '../services/jwt.service';
import { AuthSessionService } from '../services/auth-session.service';

export const validateSessionGuard: CanActivateFn = (route, state) => {
  const accessToken = localStorage.getItem('accessToken');
  const router = inject(Router);
  const jwtService = inject(JwtService);
  const authSessionService = inject(AuthSessionService);

  if (!accessToken) {
    return router.createUrlTree(['/']);
  }

  if (!jwtService.esTokenValido(accessToken)) {
    authSessionService.cerrarSesion();
    return false;
  }

  const requiredModule = route.data['module'] as string | undefined;
  if (
    requiredModule &&
    !jwtService.tieneAccesoAlModulo(accessToken, requiredModule)
  ) {
    return router.createUrlTree(['/inicio']);
  }

  return true;
};
