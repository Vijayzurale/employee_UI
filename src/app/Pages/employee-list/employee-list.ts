import { EmployeeService } from './../../services/employee-service';
import { Component, inject, OnInit, signal } from '@angular/core';
import { IEmployeeListModel } from '../../models/Employee.Model';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AttendanceLeaveService } from '../../services/attendance-leave';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    
  ],

  

  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css',
})

export class EmployeeList implements OnInit {

  EmployeeList = signal<IEmployeeListModel[]>([]);

  EmployeeService = inject(EmployeeService);
  attendanceLeaveService = inject(AttendanceLeaveService);

  ngOnInit(): void {
    this.getAllEmployees();
  }

  getAllEmployees() {

    this.EmployeeService.getAllEmployees().subscribe({

      next: (res: IEmployeeListModel[]) => {

        console.log("API Response =", res);

        this.EmployeeList.set(res);

      },

      error: (err) => {

        console.log(err);

      }

    });

  }

  ondelete(id: number) {

    if (confirm("Are you sure you want to delete this employee?")) {

      this.EmployeeService.deleteEmployee(id).subscribe({

        next: () => {

          this.attendanceLeaveService.removeEmployeeData(id).subscribe({
            next: () => {
              this.getAllEmployees();
            },
            error: (err) => {
              console.log(err);
              this.getAllEmployees();
            }
          });

        },

        error: (err) => {

          console.log(err);

        }

      });

    }

  }

}
