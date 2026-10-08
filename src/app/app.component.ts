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
  showTopMenu :boolean =! ["/","/inicio"].includes(this.router.url);
  alertaResponse:GenericAlertResponse= { alertVisible: false, alertType: 'success', alertTitle: '', alertMessage: '' };
  routerUrl :string ="";
  ngOnInit(): void {
    console.log(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => {
        console.log(event.urlAfterRedirects);
        this.showTopMenu =! ["/","/inicio"].includes(event.urlAfterRedirects);
        this.routerUrl = event.urlAfterRedirects;
        console.log(this.routerUrl)
      });

    this.mediatorAlertService.getAlert().subscribe(alert => {
      if (alert) {
        this.alertaResponse = alert;
      }
    });
  }

}
