import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { EmployeeModel } from '../../models/Employee.Model';

@Component({
  selector: 'app-header',
  imports: [RouterOutlet, NgIf, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  collapsed = false;
  router = inject(Router);
  loggedEmpData:EmployeeModel = new EmployeeModel();

  constructor() {
    const localData = localStorage.getItem('empLoginUser');
    if (localData !== null) {
      this.loggedEmpData = JSON.parse(localData);
    }
  }
  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }
  onLogOff() {
    localStorage.removeItem('empLoginUser');
    this.router.navigateByUrl('/home');
  }
}
