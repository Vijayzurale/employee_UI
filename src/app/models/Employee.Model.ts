export class EmployeeModel {

  employeeId !: number;
   name: string;
  contactNo: string;
  email: string;
  city: string;
  state: string;
  pincode: string;
  altContactNo: string;
  address: string;
  designationId: number;
  
  role: string;

  constructor() {
    this.employeeId = 0;
    this.name = '';
    this.contactNo = '';
    this.email = '';
    this.city = '';
    this.state = '';
    this.pincode = '';
    this.altContactNo = '';
    this.address = '';
    this.designationId = 0;
   
    this.role = '';
  }
}

export interface IEmployeeListModel {
  employeeId: number;
  name: string;
  contactNo: string;
  email: string;
  city: string;
  state: string;
  pincode: string;
  altContactNo: string;
  address: string;

  designationId: number;
  designationName: string;

  departmentId: number;
  departmentName: string;

  role: string;        // ⚠ make sure backend property name matches
  createdDate: string; // Date comes as string from API
  modifiedDate: string;
}
