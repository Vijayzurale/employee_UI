import { Designation } from './../Pages/designation/designation';
import { Observable } from 'rxjs';
 import { Injectable, inject } from '@angular/core';
 import { HttpClient} from '@angular/common/http';
 import { DepartmentModel, DesignationListModel, DesignationModel } from '../models/Department.model';
 
 @Injectable({
   providedIn: 'root',
 })
  export class Master {

  apiUrl: string = "https://localhost:7248/api/";
   http = inject(HttpClient);


  getAllDepartments() {
    return this.http.get(this.apiUrl + "DepartmentMaster/GetAllDepartments");
  }
     saveDept(obj:DepartmentModel) {
    return this.http.post(this.apiUrl + "DepartmentMaster/AddDepartment", obj);
  }

  UpdateDept(obj:DepartmentModel) {
    return this.http.put(this.apiUrl + "DepartmentMaster/UpdateDepartment", obj);
  }

  
  DeleteDeptbyId(id:number) {
    return this.http.delete(this.apiUrl + "DepartmentMaster/DeleteDepartment/"+id);
  }



// ---------- DESIGNATION APIs ----------

getAllDesignations(): Observable<DesignationListModel[]> {
  return this.http.get<DesignationListModel[]>(this.apiUrl + "DesignationMaster");
}

saveDesignation(obj: any) {
  return this.http.post(this.apiUrl + "DesignationMaster", obj);
}

updateDesignation(obj: any) {
  return this.http.put(this.apiUrl + "DesignationMaster/" + obj.designationId, obj);
}

deleteDesignationById(id: number) {
  return this.http.delete(this.apiUrl + "DesignationMaster/" + id);
}

}


 
