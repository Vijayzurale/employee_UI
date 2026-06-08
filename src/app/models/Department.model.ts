export class DepartmentModel {
    departmentId: number = 0;
    departmentName: string = "";
    isActive: boolean = true;


    constructor(){
        this.departmentId = 0;
        this.departmentName = "";
        this.isActive = true;
    }
}
export interface DesignationModel{
    designationId:number;
    departmentId:number;
    designationName:string;
    departmentName:string;
}
export interface DesignationListModel{
    designationId:number;
    departmentId:number;
    designationName:string;
    departmentName:string;
}
