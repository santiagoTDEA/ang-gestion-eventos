import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GenericAlertComponent } from '../shared/atoms/generic-alert/generic-alert.component';
import { MediatorAlertService } from './core/services/mediator-alert.service';
import { inject, OnInit } from '@angular/core';
import { GenericAlertResponse } from '../shared/atoms/generic-alert/utils/style';
import { TopMenuComponent } from '../shared/organisms/top-menu/top-menu.component';
import { SideMenuComponent } from '../shared/organisms/side-menu/side-menu.component';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

/** Rutas sin sesión: no llevan menú lateral ni barra superior. */
const PUBLIC_ROUTES = ['/', '/recuperar-cuenta'];

function isPublicRoute(url: string): boolean {
  return PUBLIC_ROUTES.includes(url.split(/[?#]/)[0]);
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GenericAlertComponent, TopMenuComponent, SideMenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent  implements OnInit {
  title = 'ang-gestion-eventos';
  private mediatorAlertService = inject(MediatorAlertService);
  private router = inject(Router);
  showTopMenu: boolean = !isPublicRoute(this.router.url);
  alertaResponse:GenericAlertResponse= { alertVisible: false, alertType: 'success', alertTitle: '', alertMessage: '' };
  /** El menú lateral se muestra en todas las rutas menos en las públicas (login y recuperar cuenta). */
  showSideMenu: boolean = !isPublicRoute(this.router.url);
  routerUrl :string = this.router.url;
  ngOnInit(): void {
    console.log(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => {
        console.log(event.urlAfterRedirects);
        this.showTopMenu = !isPublicRoute(event.urlAfterRedirects);
        this.showSideMenu = !isPublicRoute(event.urlAfterRedirects);
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
