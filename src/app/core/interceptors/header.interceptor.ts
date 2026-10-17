import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { MediatorAlertService } from '../services/mediator-alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
const ERROR_STATUS: Record<number, string> = {
  0: 'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.',
  400: 'Los datos enviados no son válidos.',
  401: 'Tu sesión expiró. Inicia sesión nuevamente.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'No se encontró el recurso solicitado.',
  408: 'La solicitud tardó demasiado. Inténtalo de nuevo.',
  409: 'Ya existe un registro con esos datos.',
  422: 'No se pudo procesar la información enviada.',
  429: 'Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.',
  500: 'Ocurrió un error en el servidor. Inténtalo más tarde.',
  502: 'El servidor no está disponible en este momento.',
  503: 'El servicio está en mantenimiento. Inténtalo más tarde.',
  504: 'El servidor tardó demasiado en responder.',
};


export const headerInterceptor: HttpInterceptorFn = (req, next) => {
  const mediatorAlertService = inject(MediatorAlertService);
  const router = inject(Router);
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }
  return next(req).pipe(
    catchError((error) => {
      console.log(error);
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }
      const errorMessage = ERROR_STATUS[error.status] || 'Ocurrió un error desconocido.';

      if (error.status === 401) {
        mediatorAlertService.setAlert({
          alertVisible: true,
          alertType: 'error',
          alertTitle: 'Error',
          alertMessage: 'Tu sesión expiró. Inicia sesión nuevamente.'
        });
        localStorage.removeItem('accessToken');
        router.navigate(['/']);
      }
      mediatorAlertService.setAlert({
        alertVisible: true,
        alertType: 'error',
        alertTitle: 'Error',
        alertMessage: errorMessage
      });

      throw error;
    })
  );
};
