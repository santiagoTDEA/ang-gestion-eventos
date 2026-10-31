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
import { ApprovalsComponent } from './features/approvals/approvals.component';
import { DiffusionComponent } from './features/diffusion/diffusion.component';

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
        data: { module: 'eventos' },
        canActivate: [validateSessionGuard]
    },
    {
        path:'aprobaciones',
        component: ApprovalsComponent,
        data: { module: 'aprobaciones' },
        canActivate: [validateSessionGuard]
    },
    {
        path:'difusion',
        component: DiffusionComponent,
        data: { module: 'difusion' },
        canActivate: [validateSessionGuard]
    },
    {
        path:'facultades',
        component: FacultyComponent ,
        data: { module: 'facultades' },
        canActivate: [validateSessionGuard]
    },
    {
        path:'roles',
        component: RolesComponent ,
        data: { module: 'roles' },
        canActivate: [validateSessionGuard]
    },
    {
        path:'usuarios',
        component: UsersComponent ,
        data: { module: 'usuarios' },
        canActivate: [validateSessionGuard]
    },
    {
        path:'personas',
        component: PeoplesComponent ,
        data: { module: 'personas' },
        canActivate: [validateSessionGuard]
    },
    {
        path:'estados',
        component: StatusComponent ,
        data: { module: 'estados' },
        canActivate: [validateSessionGuard]
    },
    {
        path:'**',
        redirectTo:"/"
    }
];
