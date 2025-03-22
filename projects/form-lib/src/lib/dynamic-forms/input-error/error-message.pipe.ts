import { inject, Pipe, PipeTransform } from '@angular/core';
import {
  ERROR_MESSAGES,
  VALIDATION_ERROR_MESSAGES,
} from './validation-error-messages.token';

@Pipe({
  name: 'errorMessage',
  standalone: true,
})
export class ErrorMessagePipe implements PipeTransform {
  private errorMessages = {
    ...ERROR_MESSAGES,
    ...inject(VALIDATION_ERROR_MESSAGES),
  };

  transform(key: string, errValue: any): string {
    if (!this.errorMessages[key]) {
      console.warn(`Missing message for ${key} validator...`);
      return '';
    }
    return this.errorMessages[key](errValue);
  }
}
