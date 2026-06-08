import { AfterViewInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AttendanceLeaveService } from '../../services/attendance-leave';
import { EmployeeService } from '../../services/employee-service';
import { IEmployeeListModel } from '../../models/Employee.Model';
import { LeaveRequest } from '../../models/AttendanceLeave.model';

interface OverviewCard {
  label: string;
  value: number;
  hint: string;
  icon: string;
  className: string;
}

interface DepartmentOverview {
  name: string;
  count: number;
  percent: number;
}

interface RoleOverview {
  name: string;
  count: number;
  percent: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements AfterViewInit {
  employees: IEmployeeListModel[] = [];
  designations: any[] = [];
  departments: any[] = [];

  totalEmployees = 0;
  totalDesignations = 0;
  totalDepartments = 0;
  activeEmployees = 0;
  hrEmployees = 0;
  employeesOnLeaveToday = 0;
  employeeCoverage = 0;

  isLoading = true;
  errorMessage = '';
  overviewCards: OverviewCard[] = [];
  departmentOverview: DepartmentOverview[] = [];
  roleOverview: RoleOverview[] = [];
  recentEmployees: IEmployeeListModel[] = [];
  filteredEmployees: IEmployeeListModel[] = [];
  roleOptions: string[] = [];
  departmentOptions: string[] = [];
  searchText = '';
  selectedRole = 'All';
  selectedDepartment = 'All';
  lastUpdated = '';

  constructor(
    private empService: EmployeeService,
    private attendanceLeaveService: AttendanceLeaveService
  ) {}

  ngAfterViewInit(): void {
    this.loadEmployees();
  }

  loadEmployees() {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      employees: this.empService.getAllEmployees(),
      leaves: this.attendanceLeaveService.getAllLeaves(),
    }).subscribe({
      next: ({ employees, leaves }) => {
        this.employees = employees ?? [];
        this.totalEmployees = this.employees.length;
        this.activeEmployees = this.employees.filter((e) => e.role === 'Employee').length;
        this.totalDepartments = new Set(this.employees.map((e) => e.departmentName)).size;
        this.totalDesignations = new Set(this.employees.map((e) => e.designationName)).size;
        this.employeesOnLeaveToday = this.getEmployeesOnLeaveToday(leaves ?? []);

        this.prepareEmployeeOverview();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data', err);
        this.isLoading = false;
        this.errorMessage = 'Unable to load employee overview. Please try again.';
      },
    });
  }

  loadDashboardData() {
    this.loadEmployees();
  }

  applyFilters(): void {
    const searchValue = this.normalizeText(this.searchText);
    const selectedRole = this.normalizeText(this.selectedRole);
    const selectedDepartment = this.normalizeText(this.selectedDepartment);

    this.filteredEmployees = this.employees.filter((employee) => {
      const matchesSearch =
        !searchValue ||
        this.normalizeText(employee.name).includes(searchValue) ||
        this.normalizeText(employee.email).includes(searchValue) ||
        this.normalizeText(employee.designationName).includes(searchValue) ||
        this.normalizeText(employee.departmentName).includes(searchValue);

      const matchesRole =
        selectedRole === 'all' || this.normalizeText(employee.role) === selectedRole;
      const matchesDepartment =
        selectedDepartment === 'all' ||
        this.normalizeText(employee.departmentName) === selectedDepartment;

      return matchesSearch && matchesRole && matchesDepartment;
    });
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedRole = 'All';
    this.selectedDepartment = 'All';
    this.applyFilters();
  }

  filterByRole(role: string): void {
    this.selectedRole = role;
    this.applyFilters();
  }

  private prepareEmployeeOverview(): void {
    this.totalEmployees = this.employees.length;
    this.totalDepartments = new Set(this.employees.map((employee) => employee.departmentName)).size;
    this.totalDesignations = new Set(this.employees.map((employee) => employee.designationName)).size;
    this.activeEmployees = this.employees.filter(
      (employee) => this.normalizeText(employee.role) === 'employee'
    ).length;
    this.hrEmployees = this.employees.filter((employee) => this.normalizeText(employee.role) === 'hr')
      .length;
    this.employeeCoverage = this.getPercent(this.activeEmployees, this.totalEmployees);

    this.overviewCards = [
      {
        label: 'Total Employees',
        value: this.totalEmployees,
        hint: `${this.employeeCoverage}% employee role coverage`,
        icon: 'fa-users',
        className: 'card-blue',
      },
      {
        label: 'Departments',
        value: this.totalDepartments,
        hint: 'Active company teams',
        icon: 'fa-building',
        className: 'card-green',
      },
      {
        label: 'Designations',
        value: this.totalDesignations,
        hint: 'Available job titles',
        icon: 'fa-id-badge',
        className: 'card-orange',
      },
      {
        label: 'HR Members',
        value: this.hrEmployees,
        hint: `${this.activeEmployees} employees managed`,
        icon: 'fa-user-tie',
        className: 'card-red',
      },
      {
        label: 'On Leave Today',
        value: this.employeesOnLeaveToday,
        hint: 'Employees currently on leave',
        icon: 'fa-plane-departure',
        className: 'card-purple',
      },
    ];

    this.departmentOverview = this.getDepartmentOverview();
    this.roleOverview = this.getRoleOverview();
    this.recentEmployees = this.getRecentEmployees();
    this.filteredEmployees = [...this.recentEmployees];
    this.roleOptions = this.getUniqueValues(this.employees.map((employee) => employee.role));
    this.departmentOptions = this.getUniqueValues(
      this.employees.map((employee) => employee.departmentName)
    );
    this.lastUpdated = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private getDepartmentOverview(): DepartmentOverview[] {
    const departmentMap = new Map<string, number>();

    this.employees.forEach((employee) => {
      const departmentName = employee.departmentName || 'Not Assigned';
      departmentMap.set(departmentName, (departmentMap.get(departmentName) ?? 0) + 1);
    });

    return Array.from(departmentMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percent: this.getPercent(count, this.totalEmployees),
      }))
      .sort((first, second) => second.count - first.count)
      .slice(0, 5);
  }

  private getRoleOverview(): RoleOverview[] {
    const roleMap = new Map<string, number>();

    this.employees.forEach((employee) => {
      const roleName = employee.role || 'Not Assigned';
      roleMap.set(roleName, (roleMap.get(roleName) ?? 0) + 1);
    });

    return Array.from(roleMap.entries()).map(([name, count]) => ({
      name,
      count,
      percent: this.getPercent(count, this.totalEmployees),
    }));
  }

  private getEmployeesOnLeaveToday(leaves: LeaveRequest[]): number {
    const today = this.getTodayDateString();
    const ids = new Set<number>();

    leaves.forEach((leave) => {
      if (leave.status === 'Approved' && leave.startDate <= today && today <= leave.endDate) {
        ids.add(leave.employeeId);
      }
    });

    return ids.size;
  }

  private getRecentEmployees(): IEmployeeListModel[] {
    return [...this.employees]
      .sort((first, second) => {
        const firstDate = new Date(first.createdDate || 0).getTime();
        const secondDate = new Date(second.createdDate || 0).getTime();
        return secondDate - firstDate;
      })
      .slice(0, 6);
  }

  private getTodayDateString(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private getPercent(value: number, total: number): number {
    return total ? Math.round((value / total) * 100) : 0;
  }

  private getUniqueValues(values: string[]): string[] {
    return Array.from(new Set(values.filter(Boolean))).sort();
  }

  private normalizeText(value: string | null | undefined): string {
    return (value ?? '').trim().toLowerCase();
  }
}
