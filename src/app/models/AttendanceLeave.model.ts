export interface AttendanceRecord {
  attendanceId: number;
  employeeId: number;
  employeeName: string;
  date: string; // YYYY-MM-DD
  checkInTime: string; // HH:MM:SS AM/PM or similar
  checkOutTime?: string;
  durationHours?: number;
  status: 'Present' | 'Absent' | 'Late' | 'On Leave';
}

export interface LeaveRequest {
  leaveId: number;
  employeeId: number;
  employeeName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  leaveType: 'Casual' | 'Sick' | 'Annual' | 'Maternity' | 'Paternity';
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestDate: string; // YYYY-MM-DD
}
