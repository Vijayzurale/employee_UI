import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceLeaveService } from '../../services/attendance-leave';
import { LeaveRequest } from '../../models/AttendanceLeave.model';

@Component({
  selector: 'app-leave',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave.html',
  styleUrl: './leave.css',
})
export class LeaveComponent implements OnInit {
  private service = inject(AttendanceLeaveService);

  loggedUser: any = null;
  isHR = false;

  // New Request Form Model
  newLeave: any = {
    startDate: '',
    endDate: '',
    leaveType: 'Casual',
    reason: '',
  };

  // Lists
  myLeaves: LeaveRequest[] = [];
  allLeaves: LeaveRequest[] = [];
  filteredLeaves: LeaveRequest[] = [];

  // HR Filters
  searchText = '';
  selectedStatus = 'All';

  message = '';
  isMessageSuccess = true;

  ngOnInit(): void {
    const localData = localStorage.getItem('empLoginUser');
    if (localData) {
      this.loggedUser = JSON.parse(localData);
      this.isHR = this.loggedUser?.role?.toUpperCase() === 'HR';
    }

    this.loadData();
  }

  loadData(): void {
    if (!this.loggedUser) return;

    if (this.isHR) {
      this.service.getAllLeaves().subscribe((res) => {
        this.allLeaves = res;
        this.applyFilters();
      });
    } else {
      const empId = this.loggedUser.employeeId || 101;
      this.service.getLeavesByEmployee(empId).subscribe((res) => {
        this.myLeaves = res;
      });
    }
  }

  onSubmitRequest(form: any): void {
    if (!this.loggedUser) return;

    // Validation
    if (!this.newLeave.startDate || !this.newLeave.endDate || !this.newLeave.reason.trim()) {
      this.showMessage('Please fill all fields.', false);
      return;
    }

    const start = new Date(this.newLeave.startDate);
    const end = new Date(this.newLeave.endDate);
    if (end < start) {
      this.showMessage('End date cannot be earlier than start date.', false);
      return;
    }

    const payload: Omit<LeaveRequest, 'leaveId' | 'status' | 'requestDate'> = {
      employeeId: this.loggedUser.employeeId || 101,
      employeeName: this.loggedUser.name || 'Current Employee',
      startDate: this.newLeave.startDate,
      endDate: this.newLeave.endDate,
      leaveType: this.newLeave.leaveType,
      reason: this.newLeave.reason,
    };

    this.service.requestLeave(payload).subscribe(() => {
      this.showMessage('Leave request submitted successfully!', true);
      this.resetForm(form);
      this.loadData();
    });
  }

  approveRequest(leaveId: number): void {
    this.service.updateLeaveStatus(leaveId, 'Approved').subscribe((res) => {
      if (res) {
        this.showMessage('Leave request approved.', true);
        this.loadData();
      }
    });
  }

  rejectRequest(leaveId: number): void {
    this.service.updateLeaveStatus(leaveId, 'Rejected').subscribe((res) => {
      if (res) {
        this.showMessage('Leave request rejected.', true);
        this.loadData();
      }
    });
  }

  applyFilters(): void {
    const search = this.searchText.trim().toLowerCase();
    const status = this.selectedStatus.trim().toLowerCase();

    this.filteredLeaves = this.allLeaves.filter((l) => {
      const matchesSearch =
        !search ||
        l.employeeName.toLowerCase().includes(search) ||
        String(l.employeeId).includes(search);

      const matchesStatus = status === 'all' || l.status.toLowerCase() === status;

      return matchesSearch && matchesStatus;
    });
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedStatus = 'All';
    this.applyFilters();
  }

  private resetForm(form: any): void {
    form.resetForm({
      leaveType: 'Casual',
    });
    this.newLeave = {
      startDate: '',
      endDate: '',
      leaveType: 'Casual',
      reason: '',
    };
  }

  private showMessage(msg: string, isSuccess: boolean): void {
    this.message = msg;
    this.isMessageSuccess = isSuccess;
    setTimeout(() => {
      this.message = '';
    }, 4000);
  }
}
