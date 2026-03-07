import { Master } from './../../services/master';
import { DesignationModel } from './../../models/Department.model';
import { Component, inject } from '@angular/core';
import { EmployeeModel } from '../../models/Employee.Model';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee-service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Route } from '@angular/router';

@Component({
  selector: 'app-employee-form',
  imports: [FormsModule, AsyncPipe],
  templateUrl: './employee-form.html',
  styleUrl: './employee-form.css',
})
export class EmployeeForm {

  newEmployeeObj: EmployeeModel = new EmployeeModel();

  employeeService = inject(EmployeeService);
  MasterService = inject(Master);
  Router = inject(Router);
  activeRoute = inject(ActivatedRoute);

  $designationList: Observable<DesignationModel[]> = new Observable<DesignationModel[]>();

  constructor() {

    this.$designationList = this.MasterService.getAllDesignations();

    this.activeRoute.params.subscribe((res: any) => {
      if (res.id !== 0) {
        this.newEmployeeObj.employeeId = res.id;
        this.getEmpById();
      }
    });
  }

  getEmpById() {
    this.employeeService.getEmpById(this.newEmployeeObj.employeeId).subscribe({
      next: (result) => {
        this.newEmployeeObj = result;
      }
    });
  }

  onsaveEmp(form: any) {

    this.employeeService.saveEmployee(this.newEmployeeObj).subscribe({
      next: () => {
        alert('Employee saved successfully!');
        form.resetForm();   // ✅ PROPER RESET
        this.Router.navigate(['/employee-list']);
      },
      error: () => {
        alert('Employee failed!');
      }
    });
  }

  onupdateEmp() {
    this.employeeService.updateEmp(
      this.newEmployeeObj.employeeId,
      this.newEmployeeObj
    ).subscribe({
      next: () => {
        alert('Employee updated successfully!');
      },
      error: () => {
        alert('Employee update failed!');
      }
    });
  }

  onReset(form: any) {
    form.resetForm();
  }

}