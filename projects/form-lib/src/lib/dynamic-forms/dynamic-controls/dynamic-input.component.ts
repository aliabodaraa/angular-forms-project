import { ChangeDetectionStrategy, Component } from '@angular/core';
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
    {{ config.order }}
    <label [for]="controlKey">{{ configInput?.label }}</label>
    <input
      [formControlName]="controlKey"
      [value]="configInput?.value"
      [id]="controlKey"
      [type]="configInput?.type"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicInputComponent extends BaseDynamicControl {
  get configInput(): INPUT | null {
    return this.config as INPUT;
  }
}
