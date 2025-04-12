import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { LIB_CONFIG } from './lib-config';
import {
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
} from '@angular/forms';
import { DynamicControlResolver } from './dynamic-forms/dynamic-control-resolver.service';
import { comparatorFn } from './dynamic-forms/dynamic-controls/base-dynamic-control';
import { CustomValidatorsType } from './dynamic-forms';

@Component({
  selector: 'lib-form',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form
      [formGroup]="form"
      (reset)="onReset($event)"
      (ngSubmit)="onSubmit($event)"
      *ngIf="config$ | async as formConfig"
    >
      <div class="dynamic-form-container">
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

        <button [disabled]="form.invalid || form.pending">Save</button>
        <button
          *ngIf="withReseting"
          class="reset-button"
          type="reset"
          [disabled]="form.pristine"
        >
          Reset
        </button>
      </div>
    </form>
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
export class FormLibComponent {
  private initialFormValues: Record<string, any> = {};
  protected controlResolver = inject(DynamicControlResolver);
  protected comparatorFn = comparatorFn;
  public form = new FormGroup({});
  public config$ = inject(LIB_CONFIG);

  @ViewChild(FormGroupDirective)
  private formDir!: FormGroupDirective;
  @Input() customValidators: CustomValidatorsType;
  @Input() set formValue(values: any) {
    setTimeout(() => {
      this.initialFormValues = this.buildInitialFormValue(values);
      this.form.reset(values);
    }, 300);
  }
  @Input() withReseting: boolean = true;
  @Output() submissionEmitter = new EventEmitter<Record<string, any>>();

  private buildInitialFormValue(formData: Record<string, any>) {
    let initialValue = {};
    for (const key in formData) {
      const element = formData[key];
      if (typeof element == 'number')
        initialValue = { ...initialValue, [key]: 0 };
      else if (typeof element == 'string')
        initialValue = { ...initialValue, [key]: '' };
      else if (Array.isArray(element))
        initialValue = { ...initialValue, [key]: [] };
      else if (typeof element == 'object')
        initialValue = { ...initialValue, [key]: {} };
    }
    return initialValue;
  }

  onSubmit(_: Event) {
    this.initialFormValues = this.form.value;
    this.formDir.resetForm(this.form.value);
    this.submissionEmitter.emit(this.form.value);
  }

  onReset(e: Event) {
    e.preventDefault();
    this.formDir.resetForm(this.initialFormValues);
  }

  ngAfterViewInit(): void {
    this.initialFormValues = this.buildInitialFormValue(this.form.value);
  }
}
