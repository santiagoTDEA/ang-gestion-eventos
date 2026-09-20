import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GenericAlertResponse } from '../../../shared/atoms/generic-alert/utils/style';

@Injectable({
  providedIn: 'root'
})
export class MediatorAlertService {

  alert = new BehaviorSubject<GenericAlertResponse | null>(null);
  constructor() {

  }
  getAlert() {
    return this.alert.asObservable();
  }

  getCurrentAlert() {
    console.log(this.alert.getValue());
    return this.alert.getValue();
  } 
  setAlert(message: GenericAlertResponse | null) {
    this.alert.next(message);
  }
}
