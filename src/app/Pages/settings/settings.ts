import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee-service';
import { EmployeeModel } from '../../models/Employee.Model';

interface UiSettings {
  companyName: string;
  defaultPage: string;
  recordsPerPage: number;
  compactTables: boolean;
  autoRefresh: boolean;
  emailUpdates: boolean;
  accentColor: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  private readonly storageKey = 'employeeUiSettings';
  private employeeService = inject(EmployeeService);

  settings: UiSettings = this.getDefaultSettings();
  loggedEmpData: EmployeeModel = new EmployeeModel();
  statusMessage = '';
  apiStatus: 'Checking' | 'Online' | 'Offline' = 'Checking';
  apiCheckedAt = '';
  employeeCount = 0;

  ngOnInit(): void {
    this.loadSettings();
    this.loadSession();
    this.checkApiStatus();
  }

  saveSettings(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
    this.statusMessage = 'Settings saved successfully.';
  }

  resetSettings(): void {
    this.settings = this.getDefaultSettings();
    localStorage.removeItem(this.storageKey);
    this.statusMessage = 'Settings reset to default.';
  }

  checkApiStatus(): void {
    this.apiStatus = 'Checking';

    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employeeCount = employees?.length ?? 0;
        this.apiStatus = 'Online';
        this.apiCheckedAt = new Date().toLocaleString();
      },
      error: (err) => {
        console.log('API health check failed =>', err);
        this.apiStatus = 'Offline';
        this.apiCheckedAt = new Date().toLocaleString();
      },
    });
  }

  clearLocalPreferences(): void {
    localStorage.removeItem(this.storageKey);
    this.settings = this.getDefaultSettings();
    this.statusMessage = 'Local preferences cleared.';
  }

  private loadSettings(): void {
    const savedSettings = localStorage.getItem(this.storageKey);

    if (savedSettings) {
      this.settings = { ...this.getDefaultSettings(), ...JSON.parse(savedSettings) };
    }
  }

  private loadSession(): void {
    const localData = sessionStorage.getItem('empLoginUser');

    if (localData) {
      this.loggedEmpData = JSON.parse(localData);
    }
  }

  private getDefaultSettings(): UiSettings {
    return {
      companyName: 'Employee Admin',
      defaultPage: 'dashboard',
      recordsPerPage: 10,
      compactTables: false,
      autoRefresh: true,
      emailUpdates: false,
      accentColor: '#1f6f8b',
    };
  }
}
