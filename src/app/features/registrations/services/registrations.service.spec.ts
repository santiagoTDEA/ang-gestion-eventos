import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { RegistrationsService } from './registrations.service';
import { environment } from '../../../../environments/environment';

describe('RegistrationsService', () => {
  const url = `${environment.apiUrl}registrations`;
  let service: RegistrationsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(RegistrationsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('pide los eventos aprobados', () => {
    service.getEvents().subscribe();
    expect(http.expectOne(`${url}/events`).request.method).toBe('GET');
  });

  it('pide los inscritos de un evento', () => {
    service.getByEvent(7).subscribe();
    expect(http.expectOne(`${url}/events/7`).request.method).toBe('GET');
  });

  it('inscribe con el formulario', () => {
    const data = {
      documentType: 'CC' as const, documentNumber: '1037654321', firstNames: 'Ana',
      lastNames: 'Ruiz', email: 'ana@correo.com', phone: '3001234567'
    };
    service.register(7, data).subscribe();

    const req = http.expectOne(`${url}/events/7`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
  });

  it('carga el Excel en el campo "file"', () => {
    const file = new File(['x'], 'inscritos.xlsx');
    service.importExcel(7, file).subscribe();

    const req = http.expectOne(`${url}/events/7/import`);
    expect(req.request.method).toBe('POST');
    expect((req.request.body as FormData).get('file')).toEqual(jasmine.any(File));
  });

  it('quita una inscripción', () => {
    service.remove(3).subscribe();
    expect(http.expectOne(`${url}/3`).request.method).toBe('DELETE');
  });

  it('descarga la plantilla como blob', () => {
    service.getTemplate().subscribe();
    expect(http.expectOne(`${url}/template`).request.responseType).toBe('blob');
  });
});
