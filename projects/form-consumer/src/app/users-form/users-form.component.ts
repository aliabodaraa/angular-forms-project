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
  data = {};
  ngAfterViewInit(): void {}
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    setTimeout(() => {
      console.log('-----');
      this.data = {
        Gender: 'female',
        email: 'aliabodraa@yahoo.com',
        fullName: 'ali101',
        reviewRating: 'good',
        role: 'editor',
        ArrayWithComplexGroups: [
          {
            label00: {
              label: '0933751751',
              phoneNumber: '0962636524',
            },
            phoneNumber00: {
              label: '0933751751',
              phoneNumber: '0962636524',
            },
          },
        ],
        ArrayWithControls: [1, 2, 3, 4],
        ArrayWithFormArrays: [['0933751751', '0933751751']],
        ArrayWithGroups: [
          {
            label: '09337517511111',
            phoneNumber: '09626365241111111',
          },
          {
            label: '09337517512222222',
            phoneNumber: '096263652422222222',
          },
        ],
        socialProfiles: {
          instagram: 1,
          twitter: 2,
          youtube: 3,
        },
        terms: true,
      };
    }, 2000);
  }
}
