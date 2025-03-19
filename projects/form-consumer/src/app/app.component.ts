import { Component } from '@angular/core';
import { UsersFormComponent } from './users-form/users-form.component';
import { CompanyFormComponent } from './company-form/company-form.component';
import { RatingPickerPageComponent } from './custom-rating-picker/rating-picker-page/rating-picker-page.component';

@Component({
  selector: 'app-root',
  imports: [
    UsersFormComponent,
    CompanyFormComponent,
    RatingPickerPageComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'form-consumer';
}
