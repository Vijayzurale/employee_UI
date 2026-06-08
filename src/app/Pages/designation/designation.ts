import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Master } from '../../services/master';
import { AsyncPipe } from '@angular/common';
import { Observable, BehaviorSubject, switchMap } from 'rxjs';
import { EmployeeService } from '../../services/employee-service';

@Component({
  selector: 'app-designation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AsyncPipe],
  templateUrl: './designation.html',
  styleUrl: './designation.css',
})
export class Designation implements OnInit {

  // Use a numeric timestamp so each refresh emits a new, unique value
  private refresh$ = new BehaviorSubject<number>(Date.now());

  masterService = inject(Master);
  employeeService = inject(EmployeeService);
  fb = inject(FormBuilder);

  designationForm!: FormGroup;

  $designationList!: Observable<any[]>;
  departmentList: any[] = [];
  departmentStatusMap: Record<number, boolean> = {};
  employeeCountMap: Record<number, number> = {};

  isEditMode = false;
  isLoading = signal(false);
  deleteMessage = '';

  ngOnInit() {
    this.$designationList = this.refresh$.pipe(
      switchMap(() => this.masterService.getAllDesignations())
    );

    this.createForm();
    this.loadDesignations();
    this.loadDepartments();
    this.loadEmployeeCounts();
  }

  // ================= FORM =================

  createForm() {
    this.designationForm = this.fb.group({
      designationId: [0],
      designationName: ['', Validators.required],
      departmentId: ['', Validators.required]
    });
  }

  // ================= LOAD =================

  loadDesignations() {
    this.refresh$.next(Date.now());
  }

  loadDepartments() {
    this.masterService.getAllDepartments().subscribe((res: any) => {
      this.departmentList = res;
      this.departmentStatusMap = res.reduce(
        (map: Record<number, boolean>, dept: any) => {
          map[dept.departmentId] = dept.isActive ?? true;
          return map;
        },
        {}
      );
    });
  }

  loadEmployeeCounts() {
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employeeCountMap = employees.reduce(
          (map: Record<number, number>, employee: any) => {
            const designationId = Number(employee.designationId);
            map[designationId] = (map[designationId] ?? 0) + 1;
            return map;
          },
          {}
        );
      },
      error: (err) => {
        console.error('Failed to load employee counts', err);
      },
    });
  }

  // ================= SAVE / UPDATE =================

  onSave() {

    if (this.designationForm.invalid) return;

    const obj = {
      designationId: this.designationForm.value.designationId,
      designationName: this.designationForm.value.designationName,
      departmentId: Number(this.designationForm.value.departmentId)
    };

    console.log("Payload 👉", obj);

    if (this.isEditMode) {

      this.masterService.updateDesignation(obj.designationId, obj).subscribe({
        next: () => {
          this.loadDesignations();
          this.loadEmployeeCounts();
          this.resetForm();
        },
        error: (err:any) => {
          console.log(err);
        }
      });

    }
    else {

      this.masterService.saveDesignation(obj).subscribe({
        next: () => {
          this.loadDesignations();
          this.loadEmployeeCounts();
          this.resetForm();
        },
        error: () => {

        }
      });

    }

  }

  // ================= EDIT =================

  onEdit(item: any) {

    this.isEditMode = true;

    this.designationForm.patchValue({
      designationId: item.designationId,
      designationName: item.designationName,
      departmentId: item.departmentId
    });

  }

  // ================= DELETE =================

  onDelete(id: number) {

    const isDelete = confirm("Are you sure you want to delete this designation?");

    if (isDelete) {

      this.employeeService.getAllEmployees().subscribe({

        next: (employees) => {
          const isDesignationAssigned = employees.some(
            (employee) => Number(employee.designationId) === Number(id)
          );

          if (isDesignationAssigned) {
            this.deleteMessage =
              'This designation is assigned to employees. Remove or update those employees before deleting.';
            return;
          }

          this.deleteMessage = '';
          this.masterService.deleteDesignationById(id).subscribe({

            next: () => {
              console.log('Designation deleted:', id);
              this.loadEmployeeCounts();
              // trigger refresh directly to ensure async pipe gets a new emission
              this.refresh$.next(Date.now());

            },

            error: (err) => {
              console.log('FULL ERROR =>', err);
              console.log('STATUS =>', err.status);
              console.log('ERROR =>', err.error);
            }

          });

        },

        error: (err) => {
          console.log('Employee list check failed =>', err);
        }

      });

    }

  }

  // ================= RESET =================

  resetForm() {
    this.isEditMode = false;

    this.designationForm.reset({
      designationId: 0,
      designationName: '',
      departmentId: ''
    });
  }

  getDepartmentStatus(departmentId: number): string {
    const isActive = this.departmentStatusMap[departmentId];
    return isActive ? 'Active' : 'Inactive';
  }

}
