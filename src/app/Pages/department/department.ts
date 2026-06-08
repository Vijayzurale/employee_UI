import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentModel } from '../../models/Department.model';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Master } from '../../services/master';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-department',
  templateUrl: './department.html',
  styleUrl: './department.css',
})
export class Department implements OnInit {
  newDeptObj: DepartmentModel = new DepartmentModel();
  masterService = inject(Master);
  deptList = signal<DepartmentModel[]>([]);

  searchTerm = '';
  statusFilter: 'All' | 'Active' | 'Inactive' = 'All';
  sortField: 'departmentName' | 'isActive' | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  pageSize = 5;
  currentPage = 1;

  ngOnInit(): void {
    this.getAllDepartments();
  }

  get filteredDeptList(): DepartmentModel[] {
    const query = this.searchTerm.trim().toLowerCase();
    let items = this.deptList();

    if (query) {
      items = items.filter((item) =>
        item.departmentName.toLowerCase().includes(query)
      );
    }

    if (this.statusFilter !== 'All') {
      const activeOnly = this.statusFilter === 'Active';
      items = items.filter((item) => item.isActive === activeOnly);
    }

    if (this.sortField) {
      items = [...items].sort((a, b) => {
        if (this.sortField === 'departmentName') {
          return a.departmentName
            .localeCompare(b.departmentName, undefined, {
              sensitivity: 'base',
            });
        }

        return Number(a.isActive) - Number(b.isActive);
      });

      if (this.sortDirection === 'desc') {
        items = items.reverse();
      }
    }

    return items;
  }

  get visibleDeptList(): DepartmentModel[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredDeptList.slice(start, start + this.pageSize);
  }

  get pageCount(): number {
    return Math.max(1, Math.ceil(this.filteredDeptList.length / this.pageSize));
  }

  get startIndex(): number {
    return this.filteredDeptList.length === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min(
      this.filteredDeptList.length,
      this.currentPage * this.pageSize
    );
  }

  get activeCount(): number {
    return this.deptList().filter((item) => item.isActive).length;
  }

  get inactiveCount(): number {
    return this.deptList().filter((item) => !item.isActive).length;
  }

  onSaveDept() {
    this.masterService.saveDept(this.newDeptObj).subscribe({
      next: () => {
        this.getAllDepartments();
        this.newDeptObj = new DepartmentModel();
        this.currentPage = 1;
      },
      error: (err: any) => {
        console.error('Save failed', err);
      },
    });
  }

  onUpdateDept() {
    this.masterService.UpdateDept(this.newDeptObj).subscribe({
      next: () => {
        this.getAllDepartments();
        this.newDeptObj = new DepartmentModel();
        this.currentPage = 1;
      },
      error: (err: any) => {
        console.error('Update failed', err);
      },
    });
  }

  onDelete(id: number) {
    const isdelete = confirm('Are you sure you want to delete this department?');
    if (!isdelete) {
      return;
    }

    this.masterService.DeleteDeptbyId(id).subscribe({
      next: () => {
        this.getAllDepartments();
        this.newDeptObj = new DepartmentModel();
        this.currentPage = 1;
      },
      error: (err: any) => {
        console.error('Delete failed', err);
      },
    });
  }

  onEdit(Data: DepartmentModel) {
    this.newDeptObj = JSON.parse(JSON.stringify(Data));
  }

  onReset() {
    this.newDeptObj = new DepartmentModel();
  }

  onFilterChanged() {
    this.currentPage = 1;
  }

  onPageSizeChanged(value: number) {
    this.pageSize = Number(value) || 5;
    this.currentPage = 1;
  }

  toggleSort(field: 'departmentName' | 'isActive') {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
    }
  }

  nextPage() {
    if (this.currentPage < this.pageCount) {
      this.currentPage += 1;
    }
  }

  getAllDepartments() {
    this.masterService.getAllDepartments().subscribe({
      next: (result: any) => {
        this.deptList.set(result);
        if (this.currentPage > this.pageCount) {
          this.currentPage = this.pageCount;
        }
      },
    });
  }
}
