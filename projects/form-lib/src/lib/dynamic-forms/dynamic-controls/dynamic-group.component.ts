import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BaseDynamicControl,
  comparatorFn,
  dynamicControlProvider,
} from './base-dynamic-control';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DynamicControlResolver } from '../dynamic-control-resolver.service';
import { GROUP } from '../dynamic-forms.model';

@Component({
  selector: 'app-dynamic-group',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  viewProviders: [dynamicControlProvider],
  template: `
    <fieldset [formGroupName]="controlKey">
      <legend>{{ configGroup?.label }}</legend>
      <ng-container
        *ngFor="let control of configGroup?.controls | keyvalue : comparatorFn"
      >
        <ng-container
          *ngIf="
            controlResolver.resolve(control.value.controlType)
              | async as componentType
          "
          [ngComponentOutlet]="componentType"
          [ngComponentOutletInputs]="{
            controlKey: control.key,
            config: control.value
          }"
        ></ng-container>
      </ng-container>
    </fieldset>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicGroupComponent extends BaseDynamicControl {
  @HostBinding('class') override hostClass = 'form-field-group';
  controlResolver = inject(DynamicControlResolver);

  override formControl = new FormGroup({});
  protected comparatorFn = comparatorFn;
  get configGroup(): GROUP | null {
    return this.config as GROUP;
  }
}
