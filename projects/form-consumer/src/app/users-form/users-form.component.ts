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
import {
  catchError,
  debounceTime,
  map,
  Observable,
  of,
  switchMap,
  timer,
} from 'rxjs';

@Component({
  selector: 'app-users-form',
  imports: [CommonModule, ReactiveFormsModule, FormLibComponent],
  standalone: true,
  templateUrl: './users-form.component.html',
  styleUrl: './users-form.component.scss',
  providers: [jsonFileProvider('assets/user.form-test.json')],
})
export class UsersFormComponent {
  constructor(private http: HttpClient) {}
  public form = new FormGroup({
    reviewRating: new FormControl('', [Validators.required]),
  });
  protected onSubmit(formValue: Record<string, any>) {
    console.log('Submitted data: ', formValue);
    // form.reset();
  }
  cd = inject(ChangeDetectorRef);
  addToArray() {
    console.log('aaaaaaaaaaaaaaaaa');
    this.banWordsArray.push('ali1');
    this.fieldsValidators = JSON.parse(JSON.stringify(this.fieldsValidators));
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
      return timer(400).pipe(
        switchMap(() =>
          this.http
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
            )
        )
      );
    };
  }
  passwordMatchingValidator(control: AbstractControl): ValidationErrors | null {
    const { password, confirmPassword } = control.value;

    if (!confirmPassword || !password) {
      return null;
    }

    if (confirmPassword === password) {
      return null;
    }

    return { passwordMatching: { message: 'Password Not Matching' } };
  }
  fieldsValidators: CustomValidatorsType = {};
  data = {};
  ngAfterViewInit(): void {}
  ngOnInit(): void {
    setTimeout(() => {
      this.data = {
        Gender: 'male',
        email: 'aliabodraa@yahoo.com (custom)',
        fullName: 'ali101 (custom)',
        reviewRating: 'good (custom)',
        role: 'admin',
        ArrayWithComplexGroups: [
          {
            label00: {
              label: '0933751751 (custom)',
              phoneNumber: '000001111110000000',
            },
            phoneNumber00: {
              label: '0933751751 (custom)',
              phoneNumber: '000002222222000000',
            },
          },
        ],
        ArrayWithControls: [1100, 2200],
        ArrayWithFormArrays: [['09331111751751', '093372222222222251751']],
        ArrayWithGroups: [
          {
            label: '000000000000',
            phoneNumber: '0000010000000',
          },
          {
            label: '0933751751',
            phoneNumber: '0000030000000',
          },
        ],
        socialProfiles: {
          instagram: 11,
          twitter: 22,
          youtube: 33,
        },
        terms: true,
      };
    }, 2000);

    this.fieldsValidators = {
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
      passwords: {
        sync: {
          fnName: 'passwordMatchingValidator',
          fnReturnedType: 'VE',
          fn: this.passwordMatchingValidator,
        },
      },
    };
  }
}
