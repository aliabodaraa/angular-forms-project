import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { LIB_CONFIG } from './lib-config';
import {
  ControlContainer,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
} from '@angular/forms';
import { DynamicControlResolver } from './dynamic-forms/dynamic-control-resolver.service';
import { comparatorFn } from './dynamic-forms/dynamic-controls/base-dynamic-control';
import { bufferCount, filter, take } from 'rxjs';
import { CustomValidatorsType } from './dynamic-forms';

@Component({
  selector: 'lib-form',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      *ngIf="formGroup && config$ | async as formConfig"
      class="dynamic-form-container"
    >
      <h3 class="form-heading">{{ formConfig.description }}</h3>
      <ng-container
        *ngFor="let control of formConfig.controls | keyvalue : comparatorFn"
      >
        <ng-container
          *ngIf="
            controlResolver.resolve(control.value) | async as componentType
          "
          [ngComponentOutlet]="componentType"
          [ngComponentOutletInputs]="{
            controlKey: control.key,
            config: control.value,
            customValidators: customValidators,
          }"
        ></ng-container>
      </ng-container>

      <div class="extenal-controls">
        <ng-content></ng-content>
      </div>

      <button [disabled]="formGroup?.invalid">Save</button>
    </div>
  `,
  styles: `
  .extenal-controls{
    margin: 12px 0;
    display: flex
;
    flex-direction: column;
    gap: 12px 0;
  }
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormLibComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  protected controlResolver = inject(DynamicControlResolver);
  protected comparatorFn = comparatorFn;
  public config$ = inject(LIB_CONFIG);
  public formGroup = inject(ControlContainer, {
    optional: true,
  }) as FormGroupDirective | null;

  ngOnInit(): void {
    this.formGroup?.statusChanges
      ?.pipe(
        bufferCount(2, 1),
        filter(
          ([prevState, nextState]) =>
            prevState === 'INVALID' && nextState === 'VALID'
        ),
        take(1)
      )
      .subscribe((stateVal) => {
        console.log('stateVal', stateVal);
        this.cdr.detectChanges();
      });
  }
  @Input() customValidators: CustomValidatorsType;
  @Input() set values(values: any) {
    setTimeout(() => {
      this.formGroup?.resetForm(values);
    }, 300);
  }
}
