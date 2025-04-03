import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  CustomValidatorsType,
  FormLibComponent,
  jsonFileProvider,
  RatingPickerComponent,
} from 'form-lib';
import { catchError, map, Observable, of } from 'rxjs';

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
  constructor(private http: HttpClient) {}
  public form = new FormGroup({
    reviewRating: new FormControl('', [Validators.required]),
  });
  protected onSubmit(form: FormGroup) {
    console.log('Submitted data: ', form.value);
    // form.reset();
  }
  fiedsValidators: CustomValidatorsType = {
    fullName: [
      {
        fnName: 'banWords',
        fnReturnedType: 'VF',
        fn: (bannedWords: string[] = []): ValidatorFn => {
          return (
            control: AbstractControl<string | null>
          ): ValidationErrors | null => {
            const foundBannedWord = bannedWords.find(
              (word) => word.toLowerCase() === control.value?.toLowerCase()
            );
            return !foundBannedWord
              ? null
              : { banWords: { bannedWord: foundBannedWord } };
          };
        },
      },
      {
        fnName: 'uniqueName',
        fnReturnedType: 'VE',
        fn: (
          control: AbstractControl<string | null>
        ):
          | Promise<ValidationErrors | null>
          | Observable<ValidationErrors | null> => {
          return this.http
            .get<unknown[]>(
              `https://jsonplaceholder.typicode.com/users?username=${control.value}`
            )
            .pipe(
              map((users) =>
                users.length === 0 ? null : { uniqueName: { isTaken: true } }
              ),
              catchError(() => of({ uniqueName: { unknownError: true } }))
            );
        },
      },
    ],
  };
}
