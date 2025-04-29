import {Component} from '@angular/core';
import {ReactiveFormsModule} from "@angular/forms";
import {SearchWithFormComponent} from "../../features/searchBar/components/search-with-form/search-with-form.component";
import {RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-home',
  imports: [ReactiveFormsModule, SearchWithFormComponent, RouterOutlet],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  constructor() { }

}
