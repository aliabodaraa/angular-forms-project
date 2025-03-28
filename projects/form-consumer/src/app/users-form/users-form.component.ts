import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  FormLibComponent,
  jsonFileProvider,
  RatingPickerComponent,
} from 'form-lib';

@Component({
  selector: 'app-users-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormLibComponent,
    RatingPickerComponent,
  ],
  standalone: true,
  templateUrl: './users-form.component.html',
  styleUrl: './users-form.component.scss',
  providers: [jsonFileProvider('assets/user.form.json')],
})
export class UsersFormComponent {
  public form = new FormGroup({
    reviewRating: new FormControl('', [Validators.required]),
  });
  protected onSubmit(form: FormGroup) {
    console.log('Submitted data: ', form.value);
    // form.reset();
  }
}
