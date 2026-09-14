import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { InicioComponent } from './features/inicio/inicio.component';

export const routes: Routes = [

    {
        path: '',
        pathMatch: 'full',
        component: LoginComponent
    },
    {
        path:'inicio',
        component: InicioComponent
    }
];
