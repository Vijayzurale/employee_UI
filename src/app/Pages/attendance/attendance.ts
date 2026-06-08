import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceLeaveService } from '../../services/attendance-leave';
import { AttendanceRecord } from '../../models/AttendanceLeave.model';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css',
})
export class AttendanceComponent implements OnInit {
  private service = inject(AttendanceLeaveService);

  loggedUser: any = null;
  isHR = false;
  
  // Today's status (for Employee)
  todayRecord: AttendanceRecord | null = null;
  isCheckedIn = false;
  todayDuration = '00:00:00';
  private timerInterval: any;

  // Records Lists
  myRecords: AttendanceRecord[] = [];
  allRecords: AttendanceRecord[] = [];
  filteredRecords: AttendanceRecord[] = [];

  // HR Filter parameters
  searchText = '';
  selectedStatus = 'All';
  selectedDate = '';

  message = '';
  isMessageSuccess = true;

  ngOnInit(): void {
    const localData = localStorage.getItem('empLoginUser');
    if (localData) {
      this.loggedUser = JSON.parse(localData);
      // In backend, role might be uppercase 'HR' or 'Employee'
      this.isHR = this.loggedUser?.role?.toUpperCase() === 'HR';
    }

    this.loadData();
  }

  loadData(): void {
    if (!this.loggedUser) return;

    if (this.isHR) {
      this.service.getAllAttendance().subscribe((res) => {
        this.allRecords = res;
        this.applyFilters();
      });
    } else {
      const empId = this.loggedUser.employeeId || 101; // fallback
      this.service.getTodayAttendance(empId).subscribe((res) => {
        this.todayRecord = res;
        this.isCheckedIn = !!res && !res.checkOutTime;
        if (this.isCheckedIn && res) {
          this.startTimer(res.checkInTime);
        }
      });

      this.service.getAttendanceByEmployee(empId).subscribe((res) => {
        this.myRecords = res;
      });
    }
  }

  handleCheckIn(): void {
    if (!this.loggedUser) return;
    const empId = this.loggedUser.employeeId || 101;
    const empName = this.loggedUser.name || 'Current Employee';

    this.service.checkIn(empId, empName).subscribe((res) => {
      this.todayRecord = res;
      this.isCheckedIn = true;
      this.showMessage('Checked in successfully!', true);
      this.startTimer(res.checkInTime);
      this.loadData();
    });
  }

  handleCheckOut(): void {
    if (!this.loggedUser) return;
    const empId = this.loggedUser.employeeId || 101;

    this.service.checkOut(empId).subscribe((res) => {
      this.todayRecord = res;
      this.isCheckedIn = false;
      this.stopTimer();
      this.showMessage('Checked out successfully!', true);
      this.loadData();
    });
  }

  applyFilters(): void {
    const search = this.searchText.trim().toLowerCase();
    const status = this.selectedStatus.trim().toLowerCase();
    const date = this.selectedDate;

    this.filteredRecords = this.allRecords.filter((rec) => {
      const matchesSearch =
        !search ||
        rec.employeeName.toLowerCase().includes(search) ||
        String(rec.employeeId).includes(search);

      const matchesStatus =
        status === 'all' || rec.status.toLowerCase() === status;

      const matchesDate = !date || rec.date === date;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedStatus = 'All';
    this.selectedDate = '';
    this.applyFilters();
  }

  private startTimer(checkInTimeStr: string): void {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      try {
        const today = new Date();
        const [timePart, ampm] = checkInTimeStr.split(' ');
        let [hours, minutes, seconds] = timePart.split(':').map(Number);
        
        if (ampm && ampm.toUpperCase() === 'PM' && hours < 12) {
          hours += 12;
        } else if (ampm && ampm.toUpperCase() === 'AM' && hours === 12) {
          hours = 0;
        }

        const checkInDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          hours,
          minutes,
          seconds || 0
        );

        const diffMs = today.getTime() - checkInDate.getTime();
        if (diffMs > 0) {
          const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
          const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
          
          this.todayDuration = `${this.padZero(diffHrs)}:${this.padZero(diffMins)}:${this.padZero(diffSecs)}`;
        }
      } catch (err) {
        this.todayDuration = '--:--:--';
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.todayDuration = '00:00:00';
  }

  private padZero(num: number): string {
    return num < 10 ? '0' + num : String(num);
  }

  private showMessage(msg: string, isSuccess: boolean): void {
    this.message = msg;
    this.isMessageSuccess = isSuccess;
    setTimeout(() => {
      this.message = '';
    }, 4000);
  }
}
