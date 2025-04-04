import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  BaseDynamicControl,
  dynamicControlProvider,
  sharedDynamicControlDeps,
} from './base-dynamic-control';
import { ValidatorMessageContainer } from '../input-error/validator-message-container.directive';
import { CHECKBOX } from '../dynamic-forms.model';

@Component({
  selector: 'app-dynamic-checkbox',
  standalone: true,
  imports: [...sharedDynamicControlDeps, ValidatorMessageContainer],
  viewProviders: [dynamicControlProvider],
  template: `
    <div>
      <input
        type="checkbox"
        [container]="containerDir.container"
        [formControlName]="controlKey"
        [checked]="configCheckbox.value"
        [id]="controlKey"
      />
      <label [for]="controlKey">{{ configCheckbox.label }}</label>
    </div>
    <ng-container
      validatorMessageContainer
      #containerDir="validatorMessageContainer"
    ></ng-container>
  `,
  styles: [
    `
      :host > div {
        display: flex;
        align-items: center;
        margin-top: 10px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicCheckboxComponent extends BaseDynamicControl {
  get configCheckbox(): CHECKBOX {
    return this.config as CHECKBOX;
  }
}
