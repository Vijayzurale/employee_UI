import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IEmployeeListModel } from '../models/Employee.Model';
import { EmployeeModel } from '../models/Employee.Model';
import { forkJoin } from 'rxjs';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/api.config';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  apiUrl: string = API_BASE_URL;
  http =inject(HttpClient);

  saveEmployee(obj:EmployeeModel) {
    return this.http.post(this.apiUrl+"EmployeeMaster", obj);

    
   
  }
  getAllEmployees() :Observable<IEmployeeListModel[]>{
    return this.http.get<IEmployeeListModel[]>(this.apiUrl+"EmployeeMaster");
  }

  getEmpById(id: number) :Observable<EmployeeModel>{
    return this.http.get<EmployeeModel>(this.apiUrl+"EmployeeMaster/"+id);
  }

  updateEmp(employeeId: number, newEmployeeObj: EmployeeModel) {
    return this.http.put(this.apiUrl+"EmployeeMaster/"+employeeId, newEmployeeObj);
  }
  deleteEmployee(id: number) {
    return this.http.delete(this.apiUrl+"EmployeeMaster/"+id);
  }
 
getDashboardData() {
  return forkJoin({
    employees: this.http.get<any[]>(this.apiUrl + 'EmployeeMaster'),
    designations: this.http.get<any[]>(this.apiUrl + 'DesignationMaster'),
    departments: this.http.get<any[]>(this.apiUrl + 'DepartmentMaster/GetAllDepartments')
  });
}
getDesignations() {
  return this.http.get<any[]>(this.apiUrl + "DesignationMaster");
}

getDepartments() {
  return this.http.get<any[]>(this.apiUrl + "DepartmentMaster/GetAllDepartments");
}


}
