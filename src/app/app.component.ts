import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GenericAlertComponent } from '../shared/atoms/generic-alert/generic-alert.component';
import { MediatorAlertService } from './core/services/mediator-alert.service';
import { inject, OnInit } from '@angular/core';
import { GenericAlertResponse } from '../shared/atoms/generic-alert/utils/style';
import { TopMenuComponent } from '../shared/organisms/top-menu/top-menu.component';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GenericAlertComponent, TopMenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent  implements OnInit {
  title = 'ang-gestion-eventos';
  private mediatorAlertService = inject(MediatorAlertService);
  private router = inject(Router);
  showTopMenu = this.router.url !== '/';
  alertaResponse:GenericAlertResponse= { alertVisible: false, alertType: 'success', alertTitle: '', alertMessage: '' };

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => {
        this.showTopMenu = event.urlAfterRedirects !== '/';
      });

    this.mediatorAlertService.getAlert().subscribe(alert => {
      if (alert) {
        this.alertaResponse = alert;
      }
    });
  }

}
