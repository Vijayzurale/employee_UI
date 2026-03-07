import { FormsModule } from '@angular/forms';
import { DepartmentModel } from '../../models/Department.model';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Master } from '../../services/master';

@Component({
  standalone: true,
  imports: [FormsModule],
  selector: 'app-department',
  templateUrl: './department.html',
  styleUrl: './department.css',
})
export class Department implements OnInit {
  newDeptObj: DepartmentModel = new DepartmentModel();
  masterService = inject(Master);
  deptList = signal<DepartmentModel[]>([]);

  ngOnInit(): void {
    this.getAllDepartments();
  }

 onSaveDept() {

  this.masterService.saveDept(this.newDeptObj).subscribe({
    next: () => {

      alert('Department Created successfully');

      this.getAllDepartments();   // reload list
      this.newDeptObj = new DepartmentModel(); // reset form
    },

    error: (err: any) => {
      alert(err.error || 'Something went wrong');
    }
  });
}
onUpdateDept() {

  this.masterService.UpdateDept(this.newDeptObj).subscribe({
    next: () => {

      alert('Department Updated successfully');

      this.getAllDepartments();   // reload list
      this.newDeptObj = new DepartmentModel(); // reset form
    },

    error: (err: any) => {
      alert(err.error || 'Something went wrong');
    }
  });
}
onDelete(id: number) {

  const isdelete = confirm('Are you sure you want to delete this department?');
  if (isdelete) {
       this.masterService.DeleteDeptbyId(id).subscribe({
    next: () => {

      alert('Department Deleted successfully');

      this.getAllDepartments();   // reload list
      this.newDeptObj = new DepartmentModel(); // reset form
    },

    error: (err: any) => {
      alert(err.error || 'Something went wrong');
    }
  });
  }
}

onEdit(Data: DepartmentModel) {
  const strData = JSON.stringify(Data);
  const parsedata = JSON.parse(strData);
  this.newDeptObj = parsedata ; // create a copy to avoid direct mutation
}

onReset(){
    this.newDeptObj = new DepartmentModel(); // reset form

}

  getAllDepartments() {
    this.masterService.getAllDepartments().subscribe({
      next: (result: any) => {
        this.deptList.set(result);
      },
    });
  }
}
