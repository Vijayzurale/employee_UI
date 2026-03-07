import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Master } from '../../services/master';
import { DepartmentModel, DesignationListModel, DesignationModel } from '../../models/Department.model';
import { AsyncPipe } from '@angular/common';
import { Observable,BehaviorSubject, switchMap } from 'rxjs';

@Component({
  selector: 'app-designation',
  standalone: true,
  imports: [ReactiveFormsModule,AsyncPipe],
  templateUrl: './designation.html',
  styleUrl: './designation.css',
})
export class Designation implements OnInit {
   private refresh$ = new BehaviorSubject<void>(undefined);

  masterService = inject(Master);
  fb = inject(FormBuilder);

  designationForm!: FormGroup;

   $designationList: Observable<DesignationListModel[]>= new Observable<DesignationListModel[]>();
   departmentList: any[] = [];

  isEditMode = false;
  isLoading = signal(false);


  ngOnInit() {
    this.$designationList = this.refresh$.pipe(
  switchMap(() => this.masterService.getAllDesignations())
);
    this.createForm();
    this.loadDesignations();
    this.loadDepartments();
  }

  createForm() {
    this.designationForm = this.fb.group({
      designationId: [0],
      designationName: ['', Validators.required],
      departmentId: ['', Validators.required]
    });
  }

  // ========== LOAD ==========

  loadDesignations() {
     this.refresh$.next();
    
  }

  loadDepartments() {
    this.masterService.getAllDepartments().subscribe((res: any) => {
      this.departmentList = res;
    });
  }

  // ========== SAVE / UPDATE ==========

  onSave() {

  if (this.designationForm.invalid) return;
  
  const obj = {
    designationName: this.designationForm.value.designationName,
    departmentId: Number(this.designationForm.value.departmentId)
  };

  console.log('Update Payload 👉', obj); // MUST CHECK

  if (this.isEditMode) {

    this.masterService.updateDesignation(obj).subscribe({
      next: () => {
        alert('Designation Updated successfully');
        this.loadDesignations();
        this.designationForm.reset();
        this.isEditMode = false;
      },
      error: (err: any) => {
        console.log(err);
        alert(err.error || err.message || 'Update failed');
      }
    });

  } else {

    this.masterService.saveDesignation(obj).subscribe({
      next: () => {
        alert('Designation Saved successfully');
        this.loadDesignations();
        this.designationForm.reset();
        this.isLoading.set(false);
      },
      error: () => {
        alert('Save failed');
        this.isLoading.set(false);
      }
    });

  }
}


  // ========== EDIT ==========

  onEdit(item: any) {
    this.isEditMode = true;
    this.isLoading.set(true);
    this.designationForm.patchValue(item);
      setTimeout(() => this.isLoading.set(false), 500); 

  }

  // ========== DELETE ==========

  onDelete(id: number) {

  const isDelete = confirm('Are you sure you want to delete this designation?');

  if (isDelete) {
    this.masterService.deleteDesignationById(id).subscribe({
      next: () => {

        alert('Designation deleted successfully ✅');

        // this.loadDesignations();     // auto refresh list
        this.resetForm();            // optional reset form
      },
      error: (err: any) => {
        alert(err.error || 'Something went wrong ❌');
      }
    });
  }

}

  // ========== RESET ==========

  resetForm() {
    this.isEditMode = false;
    this.designationForm.reset({
      designationId: 0,
      designationName: '',
      departmentId: ''
    });
  }

  
}
