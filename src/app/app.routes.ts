import { Routes } from '@angular/router';
import { validateSessionGuard } from './core/guards/validate-session.guard';
import { LoginComponent } from './features/login/login.component';
import { InicioComponent } from './features/inicio/inicio.component';
import { FacultyComponent } from './features/faculty/faculty.component';
import { RolesComponent } from './features/roles/roles.component';
import { UsersComponent } from './features/users/users.component';
import { PeoplesComponent } from './features/peoples/peoples.component';
import { StatusComponent } from './features/status/status.component';
import { EventsComponent } from './features/events/events.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: LoginComponent
    },
    {
        path:'inicio',
        component: InicioComponent,
        canActivate: [validateSessionGuard]
    },
    {
        path:'eventos',
        component: EventsComponent,
        canActivate: [validateSessionGuard]
    },
    {
        path:'facultades',
        component: FacultyComponent ,
        canActivate: [validateSessionGuard]
    },
    {
        path:'roles',
        component: RolesComponent ,
        canActivate: [validateSessionGuard]
    },
    {
        path:'usuarios',
        component: UsersComponent ,
        canActivate: [validateSessionGuard]
    },
    {
        path:'personas',
        component: PeoplesComponent ,
        canActivate: [validateSessionGuard]
    },
    {
        path:'estados',
        component: StatusComponent ,
        canActivate: [validateSessionGuard]
    },
    {
        path:'**',
        component: LoginComponent
    }
];
