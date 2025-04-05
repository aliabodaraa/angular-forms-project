import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { VALIDATION_ERROR_MESSAGES } from 'form-lib';

const ERROR_MESSAGES: { [key: string]: (args?: any) => string } = {
  required: () => `This field is required (Custom)`,
  requiredTrue: () => `This field is required (Custom)`,
  email: () => `It should be a valid email (Custom)`,
  minlength: ({ requiredLength }) =>
    `The length should be at least ${requiredLength} characters (Custom)`,
  banWords: ({ bannedWord }) =>
    `The word "${bannedWord}" isn't allowed (Custom)`,
  appBanWords: ({ bannedWord }) =>
    `The word "${bannedWord}" isn't allowed (Custom)`,
  appPasswordShouldMatch: () => `Password should match (Custom)`,
  passwordShouldMatch: () => `Password should match (Custom)`,
  pattern: () => `Wrong format (Custom)`,
  appUniqueNickname: () => `Nickname is taken (Custom)`,
  uniqueName: ({ name }) => `Nickname "${name}" is taken`,
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    { provide: VALIDATION_ERROR_MESSAGES, useValue: ERROR_MESSAGES },
  ],
};
