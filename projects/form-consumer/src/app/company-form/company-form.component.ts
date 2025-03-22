import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  DynamicValidatorMessage,
  FormLibComponent,
  jsonFileProvider,
  OptionComponent,
  SelectComponent,
  ValidatorMessageContainer,
} from 'form-lib';
export class User {
  constructor(
    public id: number,
    public name: string,
    public nickname: string,
    public country: string,
    public disabled = false
  ) {}
}
@Component({
  selector: 'app-company-form',
  imports: [
    FormLibComponent,
    ReactiveFormsModule,
    SelectComponent,
    OptionComponent,
    CommonModule,
    DynamicValidatorMessage,
    ValidatorMessageContainer,
  ],
  standalone: true,
  templateUrl: './company-form.component.html',
  styleUrl: './company-form.component.scss',
  providers: [
    jsonFileProvider('assets/company.form.json'),
    { provide: DynamicValidatorMessage, useExisting: DynamicValidatorMessage },
  ],
})
export class CompanyFormComponent {
  public form = new FormGroup({
    selectValue: new FormControl([
      new User(2, 'Niels Bohr', 'niels', 'Denmark'),
      new User(1, 'Albert Einstein', 'albert', 'Germany/USA'),
    ]),
    group: new FormGroup({
      ctrl1: new FormControl('Ali ctrl1', [Validators.required]),
      ctrl2: new FormControl(new User(2, 'Niels Bohr', 'niels', 'Denmark'), [
        Validators.required,
      ]),
    }),
  });
  protected onSubmit(form: FormGroup) {
    console.log('Submitted data: ', form.value);
    // form.reset();
  }
  //select stuff
  users: User[] = [
    new User(1, 'Albert Einstein', 'albert', 'Germany/USA'),
    new User(2, 'Niels Bohr', 'niels', 'Denmark'),
    new User(3, 'Marie Curie', 'marie', 'Poland/French'),
    new User(4, 'Isaac Newton', 'isaac', 'United Kingdom'),
    new User(5, 'Stephen Hawking', 'stephen', 'United Kingdom', true),
    new User(6, 'Max Planck', 'max', 'Germany'),
    new User(7, 'James Clerk Maxwell', 'james', 'United Kingdom'),
    new User(8, 'Michael Faraday', 'michael', 'United Kingdom'),
    new User(9, 'Richard Feynman', 'richard', 'USA'),
    new User(10, 'Ernest Rutherford', 'ernest', 'New Zealand'),
  ];
  filteredUsers = this.users;
  onSearchChanged(queryString: string) {
    this.filteredUsers = this.users.filter((user) =>
      user.name.toLowerCase().startsWith(queryString.toLowerCase())
    );
  }
  displayWithFn(user: User) {
    return user.name;
  }

  compareWithFn(user: User | null, user2: User | null) {
    return user?.id === user2?.id;
  }
  onSelectionChanged(value: unknown) {
    console.log('Selected value: ', value);
  }
}
