import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Faculty, ReturnFaculty } from '../interfaces/faculty.interfaces';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class FacultyService {

  constructor(private readonly http: HttpClient) { }


  postCreateFaculty(faculty: Faculty): Observable<ReturnFaculty> {
    return this.http.post<ReturnFaculty>(`${environment.apiUrl}faculties`, faculty);
  }

  updateFaculty(faculty: ReturnFaculty): Observable<ReturnFaculty> {
    const { id, ...facultyData } = faculty;
    return this.http.patch<ReturnFaculty>(`${environment.apiUrl}faculties/${id}`, facultyData);
  }

  getFaculties(): Observable<ReturnFaculty[]> {
    return this.http.get<ReturnFaculty[]>(`${environment.apiUrl}faculties`);
  }
}
