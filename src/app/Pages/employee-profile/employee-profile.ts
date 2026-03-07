import { ActivatedRoute, Route } from '@angular/router';
import { EmployeeService } from './../../services/employee-service';
import { Component, inject } from '@angular/core';
import { EmployeeModel } from '../../models/Employee.Model';

@Component({
  selector: 'app-employee-profile',
  imports: [],
  templateUrl: './employee-profile.html',
  styleUrl: './employee-profile.css',
})
export class EmployeeProfile {
  empservice = inject(EmployeeService);
  Route= inject(ActivatedRoute);

  employeeObj: EmployeeModel =  new EmployeeModel();
  ngOnInit(){
    const empId = this.Route.snapshot.paramMap.get('id');

    if (empId) {
      this.empservice.getEmpById(Number(empId)).subscribe(res=>{
        this.employeeObj = res;
      });
    }
  }
  }
