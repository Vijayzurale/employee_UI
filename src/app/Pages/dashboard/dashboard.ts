import { AfterViewInit, Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../services/employee-service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements AfterViewInit {

  employees: any[] = [];
  designations: any[] = [];
  departments: any[] = [];

  totalEmployees = 0;
  totalDesignations = 0;
  totalDepartments = 0;
  activeEmployees = 0;

  constructor(private empService: EmployeeService) {}

  ngAfterViewInit(): void {
  this.loadEmployees();
  
}

loadEmployees() {
  this.empService.getAllEmployees().subscribe(res => {
    this.employees = res;
    this.totalEmployees = res.length;
this.activeEmployees = this.employees.filter(
  e => e.role === 'Employee').length; 
  
  // ✅ Department count (unique)
   this.totalDepartments = new Set(
      this.employees.map(e => e.departmentName)
    ).size;

    // ✅ Designation count (unique)
    this.totalDesignations = new Set(
      this.employees.map(e => e.designationName)
    ).size;
  
 });
}

loadDepartments() {
  this.empService.getAllEmployees().subscribe(res => {
   this.employees = res;
   this.totalEmployees = res.length;
   this.loadDepartments();   

});
}

loadDesignations() {
  this.empService.getDesignations().subscribe(res => {
    this.totalDesignations = res.length;
    this.loadDesignations();
  });
}

}
