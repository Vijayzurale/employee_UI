import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { EmployeeService } from '../../services/employee-service';
import { AttendanceLeaveService } from '../../services/attendance-leave';
import { IEmployeeListModel } from '../../models/Employee.Model';

interface ReportMetric {
  label: string;
  value: string | number;
  icon: string;
}

interface BreakdownItem {
  name: string;
  count: number;
  percent: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css'],
})
export class Reports implements OnInit {
  private employeeService = inject(EmployeeService);
  private attendanceLeaveService = inject(AttendanceLeaveService);

  employees: IEmployeeListModel[] = [];
  filteredEmployees: IEmployeeListModel[] = [];
  metrics: ReportMetric[] = [];
  departmentBreakdown: BreakdownItem[] = [];
  roleBreakdown: BreakdownItem[] = [];
  departmentOptions: string[] = [];
  roleOptions: string[] = [];
  cityOptions: string[] = [];
  employeeStatusMap: Record<number, string> = {};

  searchText = '';
  selectedDepartment = 'All';
  selectedRole = 'All';
  selectedCity = 'All';
  dateFrom = '';
  dateTo = '';
  isLoading = false;
  message = '';
  lastGenerated = '';

  ngOnInit(): void {
    this.loadReportData();
  }

  loadReportData(): void {
    this.isLoading = true;
    this.message = '';

    this.employeeService.getAllEmployees().subscribe({
      next: (res) => {
        this.employees = res ?? [];
        this.departmentOptions = this.getUniqueValues(this.employees.map((item) => item.departmentName));
        this.roleOptions = this.getUniqueValues(this.employees.map((item) => item.role));
        this.cityOptions = this.getUniqueValues(this.employees.map((item) => item.city));
        this.loadEmployeeStatuses();
      },
      error: (err) => {
        console.log('Report load failed =>', err);
        this.isLoading = false;
        this.message = 'Unable to load report data.';
      },
    });
  }

  private loadEmployeeStatuses(): void {
    forkJoin({
      attendance: this.attendanceLeaveService.getAllAttendance(),
      leaves: this.attendanceLeaveService.getAllLeaves(),
    }).subscribe({
      next: ({ attendance, leaves }) => {
        this.employeeStatusMap = this.buildStatusMap(attendance, leaves);
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.log('Status load failed =>', err);
        this.employeeStatusMap = {};
        this.applyFilters();
        this.isLoading = false;
      },
    });
  }

  private buildStatusMap(attendance: any[], leaves: any[]): Record<number, string> {
    const today = this.getTodayDateString();
    const statusMap: Record<number, string> = {};
    const dailyAttendance = attendance.filter((item) => item.date === today);
    const activeLeaveIds = leaves.filter(
      (leave) =>
        leave.status === 'Approved' &&
        this.isDateInRange(today, leave.startDate, leave.endDate)
    );

    this.employees.forEach((employee) => {
      const attendanceRecord = dailyAttendance.find((item) => item.employeeId === employee.employeeId);
      if (attendanceRecord) {
        statusMap[employee.employeeId] = attendanceRecord.status === 'Late' ? 'Late' : 'Present';
        return;
      }

      const approvedLeave = activeLeaveIds.find((leave) => leave.employeeId === employee.employeeId);
      if (approvedLeave) {
        statusMap[employee.employeeId] = 'On Leave';
        return;
      }

      statusMap[employee.employeeId] = '';
    });

    return statusMap;
  }

  private getTodayDateString(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private isDateInRange(date: string, start: string, end: string): boolean {
    const time = new Date(date).getTime();
    return time >= new Date(start).getTime() && time <= new Date(end).getTime();
  }

  applyFilters(): void {
    const searchValue = this.normalizeText(this.searchText);
    const role = this.normalizeText(this.selectedRole);
    const department = this.normalizeText(this.selectedDepartment);
    const city = this.normalizeText(this.selectedCity);
    const fromTime = this.dateFrom ? new Date(this.dateFrom).setHours(0, 0, 0, 0) : 0;
    const toTime = this.dateTo ? new Date(this.dateTo).setHours(23, 59, 59, 999) : Number.MAX_SAFE_INTEGER;

    this.filteredEmployees = this.employees.filter((employee) => {
      const createdTime = employee.createdDate ? new Date(employee.createdDate).getTime() : 0;
      const matchesSearch =
        !searchValue ||
        this.normalizeText(employee.name).includes(searchValue) ||
        this.normalizeText(employee.email).includes(searchValue) ||
        this.normalizeText(employee.contactNo).includes(searchValue) ||
        this.normalizeText(employee.departmentName).includes(searchValue) ||
        this.normalizeText(employee.designationName).includes(searchValue);

      return (
        matchesSearch &&
        (role === 'all' || this.normalizeText(employee.role) === role) &&
        (department === 'all' || this.normalizeText(employee.departmentName) === department) &&
        (city === 'all' || this.normalizeText(employee.city) === city) &&
        createdTime >= fromTime &&
        createdTime <= toTime
      );
    });

    this.prepareReport();
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedDepartment = 'All';
    this.selectedRole = 'All';
    this.selectedCity = 'All';
    this.dateFrom = '';
    this.dateTo = '';
    this.applyFilters();
  }

  exportCsv(): void {
    const rows = this.filteredEmployees.map((employee, index) => [
      index + 1,
      employee.name,
      employee.email,
      employee.contactNo,
      employee.departmentName,
      employee.designationName,
      employee.city,
      employee.role,
      employee.createdDate,
    ]);
    const header = ['Sr No', 'Name', 'Email', 'Contact', 'Department', 'Designation', 'City', 'Role', 'Created Date'];
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');

    link.href = url;
    link.download = `employee-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    this.message = 'CSV report exported.';
  }

  printReport(): void {
    window.print();
  }

  private prepareReport(): void {
    const total = this.filteredEmployees.length;
    const activeEmployees = this.filteredEmployees.filter((item) => this.isEmployeeRole(item.role)).length;
    const hrMembers = this.filteredEmployees.filter((item) => this.isHrRole(item.role)).length;
    const topDepartment = this.getBreakdown(this.filteredEmployees.map((item) => item.departmentName))[0]?.name ?? 'N/A';

    this.metrics = [
      { label: 'Total Records', value: total, icon: 'fa-users' },
      { label: 'Employees', value: activeEmployees, icon: 'fa-user-check' },
      { label: 'HR Members', value: hrMembers, icon: 'fa-user-tie' },
      { label: 'Top Department', value: topDepartment, icon: 'fa-building' },
    ];
    this.departmentBreakdown = this.getBreakdown(this.filteredEmployees.map((item) => item.departmentName));
    this.roleBreakdown = this.getBreakdown(this.filteredEmployees.map((item) => item.role));
    this.lastGenerated = new Date().toLocaleString();
  }

  private getBreakdown(values: string[]): BreakdownItem[] {
    const map = new Map<string, number>();
    const total = values.filter(Boolean).length;

    values.forEach((value) => {
      const name = value || 'Not Assigned';
      map.set(name, (map.get(name) ?? 0) + 1);
    });

    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count, percent: total ? Math.round((count / total) * 100) : 0 }))
      .sort((a, b) => b.count - a.count);
  }

  private isHrRole(value: string | null | undefined): boolean {
    const normalized = this.normalizeText(value);
    return (
      normalized === 'hr' ||
      normalized.includes('hr') ||
      normalized.includes('human resource') ||
      normalized.includes('human resources')
    );
  }

  private isEmployeeRole(value: string | null | undefined): boolean {
    const normalized = this.normalizeText(value);
    return (
      normalized === 'employee' ||
      normalized.includes('employee') ||
      normalized === 'staff' ||
      normalized.includes('staff')
    );
  }

  private getUniqueValues(values: string[]): string[] {
    return Array.from(new Set(values.filter(Boolean))).sort();
  }

  private normalizeText(value: string | null | undefined): string {
    return (value ?? '').trim().toLowerCase();
  }
}

