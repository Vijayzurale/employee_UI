import { EmployeeService } from './../../services/employee-service';
import { Component, inject, OnInit, signal } from '@angular/core';
import { IEmployeeListModel } from '../../models/Employee.Model';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-employee-list',
  imports: [RouterLink],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css',
})
export class EmployeeList implements OnInit {

EmployeeList = signal<IEmployeeListModel[]>([]);

EmployeeService =inject(EmployeeService);

  ngOnInit(): void {
    this.getAllEmployees();
}
  getAllEmployees() {
    this.EmployeeService.getAllEmployees().subscribe({
      next: (res: IEmployeeListModel[]) => {
        this.EmployeeList.set(res);
      },
      error: (err) => {
        alert("Error fetching employee list");
      }
    });

  }
  ondelete(id: number) {
    if (confirm("Are you sure you want to delete this employee?")) {
      this.EmployeeService.deleteEmployee(id).subscribe({
        next: () => {
          alert("Employee deleted successfully");
          this.getAllEmployees(); // Refresh the list after deletion
        },
        error: (err) => {
          alert("Error deleting employee");
        }
      });     
  }
  
}
}