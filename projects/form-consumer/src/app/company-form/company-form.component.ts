import { Component } from '@angular/core';
import { FormLibComponent, jsonFileProvider } from 'form-lib';

@Component({
  selector: 'app-company-form',
  imports: [FormLibComponent],
  standalone: true,
  templateUrl: './company-form.component.html',
  styleUrl: './company-form.component.scss',
  providers: [jsonFileProvider('assets/company.form.json')],
})
export class CompanyFormComponent {}
