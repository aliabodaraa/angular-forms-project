import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  CUSTOM_CONTROLS_COMPONENTS,
  VALIDATION_ERROR_MESSAGES,
} from 'form-lib';
import { RatingPickerPageComponent } from './custom-rating-picker/rating-picker-page/rating-picker-page.component';

const ERROR_MESSAGES: { [key: string]: (args?: any) => string } = {
  required: () => `This field is required (Custom)`,
  requiredTrue: () => `This field is required (Custom)`,
  email: () => `It should be a valid email (Custom)`,
  minlength: ({ requiredLength, actualLength }) =>
    `The length should be at least ${requiredLength} characters but the actual length is ${actualLength}`,
  banWords: ({ bannedWord }) =>
    `The word "${bannedWord}" isn't allowed (Custom)`,
  appBanWords: ({ bannedWord }) =>
    `The word "${bannedWord}" isn't allowed (Custom)`,
  appPasswordShouldMatch: () => `Password should match (Custom)`,
  passwordShouldMatch: () => `Password should match (Custom)`,
  pattern: () => `Wrong format (Custom)`,
  appUniqueNickname: () => `Nickname is taken (Custom)`,
  uniqueName: ({ name }) => `Nickname "${name}" is taken`,
  passwordMatching: () => `Password is not match with Confirm Password`,
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    { provide: VALIDATION_ERROR_MESSAGES, useValue: ERROR_MESSAGES },
    {
      provide: CUSTOM_CONTROLS_COMPONENTS,
      useValue: new Map([['picker', RatingPickerPageComponent]]),
    },
  ],
};
