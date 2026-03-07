import { Routes } from '@angular/router';
import { Login } from './Pages/login/login';
import { Header } from './Pages/header/header';
import { DashboardComponent } from './Pages/dashboard/dashboard';
import { EmployeeForm } from './Pages/employee-form/employee-form';
import { Designation } from './Pages/designation/designation';
import { EmployeeList } from './Pages/employee-list/employee-list';
import { Department } from './Pages/department/department';
import { Home } from './Pages/home/home';
import { EmployeeProfile } from './Pages/employee-profile/employee-profile';
export const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path:'home',component:Home

    },
    { path: 'employee-profile/:id', 
        component: EmployeeProfile },
    {
        path: '',
        component: Header,
        children: [
        {  
            path: 'dashboard',
            component:DashboardComponent
        },
        
        {
            path: 'New-Employee/:id',
            component: EmployeeForm
        },
        {
            path: 'departments',
            component: Department
        },
        {
            path: 'designations',
            component: Designation
        },
        {
            path: 'employee-list',
            component: EmployeeList
        }
        ]
    }
];
