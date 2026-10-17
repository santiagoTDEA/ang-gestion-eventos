import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { CreatePersonDto, Person, UpdatePersonDto } from '../interfaces/people.interfaces';
@Injectable({
  providedIn: 'root'
})
export class PeoplesService {

  constructor(private http: HttpClient) { }

  getPeoples(): Observable<Person[]> {
    return this.http.get<Person[]>(`${environment.apiUrl}persons`);
  }

  postPeople(people: CreatePersonDto): Observable<Person> {
    return this.http.post<Person>(`${environment.apiUrl}persons`, people);
  }

  updatePeople(id: string, people: UpdatePersonDto): Observable<Person> {
    return this.http.patch<Person>(`${environment.apiUrl}persons/${id}`, people);
  }
}
