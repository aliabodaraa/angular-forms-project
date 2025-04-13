import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  inject,
  Input,
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
import { CustomValidatorsType, DynamicFormConfig } from './dynamic-forms';
import { Observable, take } from 'rxjs';
import { buildDesiredObjectStructure } from './urils/jsonData';

@Component({
  selector: 'lib-form',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form
      [formGroup]="form"
      (reset)="onReset($event)"
      (ngSubmit)="onSubmit($event)"
      *ngIf="formConfig"
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
              fieldValue: formValue?.[control.key]
            }"
          ></ng-container>
        </ng-container>

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
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormLibComponent {
  private initialFormValues: Record<string, any> = {};
  protected controlResolver = inject(DynamicControlResolver);
  protected comparatorFn = comparatorFn;
  public form = new FormGroup({});
  formConfig: DynamicFormConfig;
  json$: Observable<DynamicFormConfig>;
  @ViewChild(FormGroupDirective)
  private formDir!: FormGroupDirective;
  @Input() customValidators: CustomValidatorsType;
  _formValue: any;
  cd = inject(ChangeDetectorRef);
  @Input() set formValue(values: any) {
    if (Object.keys(values).length) {
      this._formValue = values;
      console.log('AAAAAAAAA', values);
      this.json$.pipe(take(1)).subscribe((formConfig) => {
        this.formConfig = this.justifyConfigJson(formConfig, values);
        this.cd.markForCheck();
      });
      setTimeout(() => {
        this.initialFormValues = this.buildInitialFormValue(values);
        this.form.reset(values);
      }, 300);
    }
  }
  get formValue() {
    return this._formValue;
  }
  constructor(@Inject(LIB_CONFIG) jsonObs: Observable<DynamicFormConfig>) {
    this.json$ = jsonObs;
  }

  @Input() withReseting: boolean = true;
  @Output() submissionEmitter = new EventEmitter<Record<string, any>>();
  justifyConfigJson(formConfig: DynamicFormConfig, formValue: any) {
    for (const key in formConfig.controls) {
      const element = formConfig.controls[key];
      if (element.controlType === 'group') {
        let index = 0;
        for (const fieldKey in formValue[key]) {
          element.controls = {
            ...element.controls,
            [fieldKey]: buildDesiredObjectStructure(
              (element as any)['childSkeleton'],
              index,
              formValue[key][fieldKey],
              fieldKey
            ),
          };
          index++;
        }
      } else if (element.controlType === 'array') {
        let index = 0;
        for (const fieldKey in formValue[key]) {
          element.controls.push(
            buildDesiredObjectStructure(
              (element as any)['childSkeleton'],
              index,
              formValue[key][fieldKey]
            ) as any
          );
          index++;
        }
      }
    }
    console.log(formConfig, '-----');
    return formConfig;
  }

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
