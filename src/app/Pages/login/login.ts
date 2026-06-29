import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { API_BASE_URL } from '../../core/api.config';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
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
      API_BASE_URL + 'EmployeeMaster/login',
      this.loginobj
    ).subscribe({
      next: (result: any) => {
        console.log(result);
        const loginUser = {
          ...result.data,
          token: result.data?.token ?? result.token,
        };

        sessionStorage.setItem('empLoginUser', JSON.stringify(loginUser));

        if (loginUser.role === 'Employee') {
          this.router.navigateByUrl('New-Employee/' + loginUser.employeeId);
        } else {
          this.router.navigateByUrl('dashboard');
        }
      },
        error: (err) => {

        console.error(err);
        alert('Login failed. Please check your credentials and try again.');
      }
    });
  }
}
