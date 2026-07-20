import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { AttendanceRecord, LeaveRequest } from '../models/AttendanceLeave.model';

@Injectable({
  providedIn: 'root',
})
export class AttendanceLeaveService {
  private readonly ATTENDANCE_KEY = 'emp_attendance_records';
  private readonly LEAVE_KEY = 'emp_leave_requests';
  private readonly employeeDataChangedSubject = new Subject<number>();
  readonly employeeDataChanged$ = this.employeeDataChangedSubject.asObservable();

  constructor() {
    this.seedMockData();
  }

  // Get current user's attendance status for today
  getTodayAttendance(employeeId: number): Observable<AttendanceRecord | null> {
    const records = this.getRecords<AttendanceRecord>(this.ATTENDANCE_KEY);
    const todayStr = this.getTodayDateString();
    const todayRecord = records.find(
      (r) => r.employeeId === employeeId && r.date === todayStr
    );
    return of(todayRecord || null);
  }

  // Check whether the employee is on approved leave today
  isOnApprovedLeaveToday(employeeId: number): Observable<boolean> {
    const requests = this.getRecords<LeaveRequest>(this.LEAVE_KEY);
    const todayStr = this.getTodayDateString();
    const onLeave = requests.some((request) => {
      return (
        request.employeeId === employeeId &&
        request.status === 'Approved' &&
        request.startDate <= todayStr &&
        todayStr <= request.endDate
      );
    });

    return of(onLeave);
  }

  // Check-In
  checkIn(employeeId: number, employeeName: string): Observable<AttendanceRecord> {
    const records = this.getRecords<AttendanceRecord>(this.ATTENDANCE_KEY);
    const todayStr = this.getTodayDateString();

    const approvedLeave = this.getRecords<LeaveRequest>(this.LEAVE_KEY).find((request) => {
      return (
        request.employeeId === employeeId &&
        request.status === 'Approved' &&
        request.startDate <= todayStr &&
        todayStr <= request.endDate
      );
    });

    if (approvedLeave) {
      const leaveRecord: AttendanceRecord = {
        attendanceId: records.length + 1,
        employeeId,
        employeeName,
        date: todayStr,
        checkInTime: '--',
        checkOutTime: '--',
        durationHours: 0,
        status: 'On Leave',
      };

      const existingLeaveRecord = records.find(
        (record) => record.employeeId === employeeId && record.date === todayStr
      );

      if (!existingLeaveRecord) {
        records.push(leaveRecord);
        this.saveRecords(this.ATTENDANCE_KEY, records);
      }

      return of(existingLeaveRecord || leaveRecord);
    }

    // Check if already checked in
    const existing = records.find(
      (r) => r.employeeId === employeeId && r.date === todayStr
    );
    if (existing) {
      return of(existing);
    }

    const now = new Date();
    const checkInTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Determine status: Late if check-in is after 09:15 AM
    let status: 'Present' | 'Late' = 'Present';
    const limitTime = new Date();
    limitTime.setHours(12, 0, 0, 0);
    if (now.getTime() > limitTime.getTime()) {
      status = 'Late';
    }

    const newRecord: AttendanceRecord = {
      attendanceId: records.length + 1,
      employeeId,
      employeeName,
      date: todayStr,
      checkInTime,
      status,
    };

    records.push(newRecord);
    this.saveRecords(this.ATTENDANCE_KEY, records);
    return of(newRecord);
  }

  // Check-Out
  checkOut(employeeId: number): Observable<AttendanceRecord | null> {
    const records = this.getRecords<AttendanceRecord>(this.ATTENDANCE_KEY);
    const todayStr = this.getTodayDateString();
    const index = records.findIndex(
      (r) => r.employeeId === employeeId && r.date === todayStr
    );

    if (index === -1 || records[index].checkOutTime) {
      return of(records[index] || null);
    }

    const record = records[index];
    const now = new Date();
    const checkOutTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    record.checkOutTime = checkOutTime;

    // Calculate duration
    try {
      const today = new Date();
      const timeStr = record.checkInTime;
      const isPM = /PM/i.test(timeStr);
      const isAM = /AM/i.test(timeStr);
      const [inHoursStr, inMinutes, inSecondsStr] = timeStr.replace(/[AP]M/i, '').trim().split(':');
      let inHours = parseInt(inHoursStr, 10);
      if (isPM && inHours < 12) {
        inHours += 12;
      } else if (isAM && inHours === 12) {
        inHours = 0;
      }
      const inDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        inHours,
        parseInt(inMinutes, 10),
        parseInt(inSecondsStr || '0', 10)
      );

      const diffMs = now.getTime() - inDate.getTime();
      const diffHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
      record.durationHours = diffHours > 0 ? diffHours : 0.01;
    } catch {
      record.durationHours = 8.0; // Fallback default
    }

    records[index] = record;
    this.saveRecords(this.ATTENDANCE_KEY, records);
    return of(record);
  }

  // Get attendance by employee id
  getAttendanceByEmployee(employeeId: number): Observable<AttendanceRecord[]> {
    const records = this.getRecords<AttendanceRecord>(this.ATTENDANCE_KEY);
    const filtered = records
      .filter((r) => r.employeeId === employeeId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return of(filtered);
  }

  // Get all attendance (HR view)
  getAllAttendance(): Observable<AttendanceRecord[]> {
    const records = this.getRecords<AttendanceRecord>(this.ATTENDANCE_KEY);
    const sorted = records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return of(sorted);
  }

  // Request a leave
  requestLeave(request: Omit<LeaveRequest, 'leaveId' | 'status' | 'requestDate'>): Observable<LeaveRequest> {
    const requests = this.getRecords<LeaveRequest>(this.LEAVE_KEY);
    const newRequest: LeaveRequest = {
      ...request,
      leaveId: requests.length + 1,
      status: 'Pending',
      requestDate: this.getTodayDateString(),
    };

    requests.push(newRequest);
    this.saveRecords(this.LEAVE_KEY, requests);
    return of(newRequest);
  }

  // Get leaves by employee
  getLeavesByEmployee(employeeId: number): Observable<LeaveRequest[]> {
    const requests = this.getRecords<LeaveRequest>(this.LEAVE_KEY);
    const filtered = requests
      .filter((r) => r.employeeId === employeeId)
      .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
    return of(filtered);
  }

  // Get all leaves (HR view)
  getAllLeaves(): Observable<LeaveRequest[]> {
    const requests = this.getRecords<LeaveRequest>(this.LEAVE_KEY);
    const sorted = requests.sort(
      (a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
    );
    return of(sorted);
  }

  // Approve or Reject leave request
  updateLeaveStatus(leaveId: number, status: 'Approved' | 'Rejected'): Observable<LeaveRequest | null> {
    const requests = this.getRecords<LeaveRequest>(this.LEAVE_KEY);
    const index = requests.findIndex((r) => r.leaveId === leaveId);

    if (index === -1) {
      return of(null);
    }

    requests[index].status = status;
    this.saveRecords(this.LEAVE_KEY, requests);
    return of(requests[index]);
  }

  // Remove all records related to a deleted employee
  removeEmployeeData(employeeId: number): Observable<void> {
    const attendanceRecords = this.getRecords<AttendanceRecord>(this.ATTENDANCE_KEY);
    const leaveRequests = this.getRecords<LeaveRequest>(this.LEAVE_KEY);

    const filteredAttendance = attendanceRecords.filter((record) => record.employeeId !== employeeId);
    const filteredLeaves = leaveRequests.filter((request) => request.employeeId !== employeeId);

    this.saveRecords(this.ATTENDANCE_KEY, filteredAttendance);
    this.saveRecords(this.LEAVE_KEY, filteredLeaves);
    this.employeeDataChangedSubject.next(employeeId);

    return of(void 0);
  }

  // Helper local storage access
  private getRecords<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private saveRecords<T>(key: string, records: T[]): void {
    localStorage.setItem(key, JSON.stringify(records));
  }

  private getTodayDateString(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // Seed default data for attendance and leaves so that user views look populated immediately
  private seedMockData(): void {
    if (!localStorage.getItem(this.ATTENDANCE_KEY)) {
      const today = this.getTodayDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      const mockAttendance: AttendanceRecord[] = [
      ];
      this.saveRecords(this.ATTENDANCE_KEY, mockAttendance);
    }

    if (!localStorage.getItem(this.LEAVE_KEY)) {
      const mockLeaves: LeaveRequest[] = [


      ];
      this.saveRecords(this.LEAVE_KEY, mockLeaves);
    }
  }
}
