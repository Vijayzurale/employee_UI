import { Observable } from 'rxjs';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  DepartmentModel,
  DesignationListModel,
  DesignationModel,
} from '../models/Department.model';
import { API_BASE_URL } from '../core/api.config';

type DesignationPayload = Omit<DesignationModel, 'departmentName'>;

@Injectable({
  providedIn: 'root',
})
export class Master {
  private readonly apiUrl = API_BASE_URL;
  private readonly http = inject(HttpClient);

  getAllDepartments(): Observable<DepartmentModel[]> {
    return this.http.get<DepartmentModel[]>(
      this.apiUrl + 'DepartmentMaster/GetAllDepartments'
    );
  }

  saveDept(obj: DepartmentModel): Observable<unknown> {
    return this.http.post(this.apiUrl + 'DepartmentMaster/AddDepartment', obj);
  }

  UpdateDept(obj: DepartmentModel): Observable<unknown> {
    return this.http.put(this.apiUrl + 'DepartmentMaster/UpdateDepartment', obj);
  }

  DeleteDeptbyId(id: number): Observable<unknown> {
    return this.http.delete(
      this.apiUrl + 'DepartmentMaster/DeleteDepartment/' + id
    );
  }

  getAllDesignations(): Observable<DesignationListModel[]> {
    return this.http.get<DesignationListModel[]>(this.apiUrl + 'DesignationMaster');
  }

  saveDesignation(obj: DesignationPayload): Observable<unknown> {
    return this.http.post(this.apiUrl + 'DesignationMaster', obj);
  }

  updateDesignation(id: number, data: DesignationPayload): Observable<unknown> {
    return this.http.put(this.apiUrl + 'DesignationMaster/' + id, data);
  }

  deleteDesignationById(id: number): Observable<unknown> {
    return this.http.delete(this.apiUrl + 'DesignationMaster/' + id);
  }
}
