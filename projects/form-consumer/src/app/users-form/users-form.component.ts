import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
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
  cd = inject(ChangeDetectorRef);
  addToArray() {
    console.log('aaaaaaaaaaaaaaaaa');
    this.banWordsArray.push('ali1');
    this.fiedsValidators = JSON.parse(JSON.stringify(this.fiedsValidators));
  }
  banWordsArray = ['ali'];
  bannedWordsFn(bannedWords: string[] = []) {
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
  }
  uniqueNameFn(uniqueNames: string[]) {
    return (
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
            !uniqueNames.includes(control.value!)
              ? null
              : { uniqueName: { isTaken: true, name: control.value } }
          ),
          catchError(() => of({ networkError: { unknownError: true } }))
        );
    };
  }
  fiedsValidators: CustomValidatorsType = {
    fullName: {
      sync: {
        fn: this.bannedWordsFn(this.banWordsArray),
        fnName: 'banWords',
        fnReturnedType: 'VE',
        validatorParam: ['Test', 'Dummy'],
      },
      async: {
        fnName: 'uniqueName',
        fnReturnedType: 'VF',
        fn: this.uniqueNameFn.bind(this),
        validatorParam: ['ali100', 'ali101'],
      },
    },
  };
}
