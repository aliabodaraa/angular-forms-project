import { Component } from '@angular/core';
import {
  BaseDynamicControl,
  dynamicControlProvider,
  sharedDynamicControlDeps,
} from './base-dynamic-control';
import { INPUT } from '../dynamic-forms.model';

@Component({
  selector: 'app-dynamic-input',
  standalone: true,
  imports: [...sharedDynamicControlDeps],
  viewProviders: [dynamicControlProvider],
  template: `
    <label [for]="controlKey">{{ controlKey }}</label>
    <input
      [formControlName]="controlKey"
      [value]="configInput?.value"
      [id]="controlKey"
      [type]="configInput?.type"
      [name]="controlKey"
    />
  `,
})
export class DynamicInputComponent extends BaseDynamicControl {
  get configInput(): INPUT | null {
    return this.config as INPUT;
  }
}
