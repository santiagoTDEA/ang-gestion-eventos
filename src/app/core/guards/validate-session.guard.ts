import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
export const validateSessionGuard: CanActivateFn = (route, state) => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    inject(Router).navigate(['/']);
    return false;
  }
  return true;
};
