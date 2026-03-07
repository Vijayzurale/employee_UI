import { Component } from '@angular/core';
import { Login } from "../login/login";

@Component({
  selector: 'app-home',
  imports: [Login],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
