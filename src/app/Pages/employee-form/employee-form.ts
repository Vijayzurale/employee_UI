import { Master } from './../../services/master';
import { DesignationModel } from './../../models/Department.model';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeModel } from '../../models/Employee.Model';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee-service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-employee-form',
  imports: [CommonModule, FormsModule, AsyncPipe],
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
      const employeeId = Number(res.id);

      if (employeeId > 0) {
        this.newEmployeeObj.employeeId = employeeId;
        this.getEmpById();
      }
    });
  }

  getEmpById() {
    this.employeeService.getEmpById(this.newEmployeeObj.employeeId).subscribe({
      next: (result) => {
        this.newEmployeeObj = result;
      },
      error: (err) => {
        console.log('Get employee failed:', err);
      },
    });
  }

  onsaveEmp(form: any) {

    this.employeeService.saveEmployee(this.newEmployeeObj).subscribe({
      next: () => {
        form.resetForm();   // ✅ PROPER RESET
        this.Router.navigate(['/employee-list']);
      },
      error: () => {
      }
    });
  }

  onupdateEmp() {
    this.employeeService.updateEmp(
      this.newEmployeeObj.employeeId,
      this.newEmployeeObj
    ).subscribe({
      next: () => {
        this.Router.navigate(['/employee-list']);
      },
      error: () => {
      }
    });
  }

  onReset(form: any) {
    form.resetForm();
  }

}
