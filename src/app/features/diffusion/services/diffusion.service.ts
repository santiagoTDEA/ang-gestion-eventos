import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DiffusionAssetType, DiffusionRequest, DiffusionStatus } from '../interfaces/diffusion.interfaces';

@Injectable({
  providedIn: 'root'
})
export class DiffusionService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}diffusion`;

  getRequests(): Observable<DiffusionRequest[]> {
    return this.http.get<DiffusionRequest[]>(this.url);
  }

  transition(id: number, to: DiffusionStatus, note?: string): Observable<DiffusionRequest> {
    return this.http.post<DiffusionRequest>(`${this.url}/${id}/transition`, { to, note });
  }

  uploadAsset(id: number, assetType: DiffusionAssetType, file: File): Observable<DiffusionRequest> {
    const body = new FormData();
    body.append('assetType', assetType);
    body.append('file', file);

    return this.http.post<DiffusionRequest>(`${this.url}/${id}/assets`, body);
  }

  removeAsset(id: number, assetId: number): Observable<DiffusionRequest> {
    return this.http.delete<DiffusionRequest>(`${this.url}/${id}/assets/${assetId}`);
  }

  /** URL pública de una pieza guardada en la carpeta de archivos del backend. */
  fileUrl(path: string): string {
    return `${environment.apiUrl}files/${path}`;
  }
}
