import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  loginobj: any = {
    email: '',
    contactNo: ''
  };

  http = inject(HttpClient);
  router = inject(Router);

  onlogin() {
    this.http.post<any>(
      'https://localhost:7248/api/EmployeeMaster/login',
      this.loginobj
    ).subscribe({
      next: (result: any) => {
        alert('Login success');
        console.log(result);
        debugger;
        localStorage.setItem('empLoginUser', JSON.stringify(result.data));
         if(result.data.role === "Employee"){ 
          this.router.navigateByUrl("New-Employee/"+result.data.employeeId);
         }else{
            this.router.navigateByUrl("dashboard");
         }
        this.router.navigate(['dashboard']);
      },
      error: (err) => {
        alert('Login failed');
        console.error(err);
      }
    });
  }
}
