import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { InicioComponent } from './features/inicio/inicio.component';
import { FacultyComponent } from './features/faculty/faculty.component';
import { RolesComponent } from './features/roles/roles.component';
import { UsersComponent } from './features/users/users.component';
import { PeoplesComponent } from './features/peoples/peoples.component';
import { StatusComponent } from './features/status/status.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: LoginComponent
    },
    {
        path:'inicio',
        component: InicioComponent
    },
    {
        path:'facultades',
        component: FacultyComponent  
    },
    {
        path:'roles',
        component: RolesComponent  
    },
    {
        path:'usuarios',
        component: UsersComponent  
    },
    {
        path:'personas',
        component: PeoplesComponent  
    },
    {
        path:'estados',
        component: StatusComponent  
    }
];
