import { Component } from '@angular/core';
import {
  FormLibComponent,
  jsonFileProvider,
  RatingPickerComponent,
} from 'form-lib';

@Component({
  selector: 'app-users-form',
  imports: [FormLibComponent, RatingPickerComponent],
  standalone: true,
  templateUrl: './users-form.component.html',
  styleUrl: './users-form.component.scss',
  providers: [jsonFileProvider('assets/user.form.json')],
})
export class UsersFormComponent {}
