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
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { LIB_CONFIG } from './lib-config';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
} from '@angular/forms';
import { DynamicControlResolver } from './dynamic-forms/dynamic-control-resolver.service';
import { comparatorFn } from './dynamic-forms/dynamic-controls/base-dynamic-control';
import { CustomValidatorsType, DynamicFormConfig } from './dynamic-forms';
import { BehaviorSubject, filter, map, Observable, of, take, tap } from 'rxjs';
import { adaptJsonConfigWithEnteredValues } from './urils/jsonData';

@Component({
  selector: 'lib-form',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form
      [formGroup]="form"
      (reset)="onReset($event)"
      (ngSubmit)="onSubmit($event)"
      *ngIf="json$ | async as formConfig"
    >
      <div class="dynamic-form-container">
        <h3 class="form-heading">{{ formConfig.description }}</h3>
        <ng-container
          *ngFor="let control of formConfig.controls | keyvalue : comparatorFn"
          >{{ control.key }}
          <ng-container
            *ngIf="
              controlResolver.resolve(control.value) | async as componentType
            "
            [ngComponentOutlet]="componentType"
            [ngComponentOutletInputs]="{
              controlKey: control.key,
              config: control.value,
              value: fValues[control.key]
            }"
          ></ng-container>
        </ng-container>

        <button [disabled]="submitDisabled">Save</button>
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
  private _addValidators = false;
  private initialFormValues: Record<string, any> = {};
  protected controlResolver = inject(DynamicControlResolver);
  protected comparatorFn = comparatorFn;
  public form = new FormGroup({});
  private jsonSubject = new BehaviorSubject<DynamicFormConfig | null>(null);
  json$: Observable<any> = this.jsonSubject.asObservable();
  @ViewChild(FormGroupDirective)
  private formDir!: FormGroupDirective;
  @Input() customValidators?: CustomValidatorsType;
  cd = inject(ChangeDetectorRef);
  fValues: { [x: string]: any } = {};
  @Input() set formValue(values: any) {
    this.fValues = values;
    this.build();
  }

  constructor(@Inject(LIB_CONFIG) jsonObs: Observable<DynamicFormConfig>) {
    jsonObs
      .pipe(
        tap((jsonData) => {
          this.build(jsonData);
          (this.form as any)._updateOn = jsonData.updateOn ?? 'change';
        })
      )
      .subscribe();
  }

  @Input() withReseting: boolean = true;
  @Output() submissionEmitter = new EventEmitter<Record<string, any>>();

  get submitDisabled(): boolean {
    if (this.form.pending) return true;

    if (this.form.updateOn === 'submit') {
      return false;
    }

    return this.form.invalid;
  }
  build(jsonData: DynamicFormConfig | null = this.jsonSubject.value) {
    let updatedConfig = jsonData;

    if (!updatedConfig) return;

    if (Object.keys(this.fValues).length) {
      updatedConfig = adaptJsonConfigWithEnteredValues(
        updatedConfig,
        this.fValues
      );
      this.initialFormValues = buildInitialFormValue(updatedConfig);
    }

    this.jsonSubject.next(updatedConfig);
  }
  triggerValidators() {
    for (const key in this.validatorsObj) {
      this.validatorsObj[key]();
      this.form.get(key)?.updateValueAndValidity();
    }
  }
  submitted: boolean = false;
  checkFormValidity(): Observable<boolean> {
    this.form.updateValueAndValidity();
    return this.form.statusChanges.pipe(
      filter((status) => status !== 'PENDING'),
      take(1),
      map(() => this.form.valid)
    );
  }
  async onSubmit(_: Event) {
    this.submitted = true;
    if (this.form.updateOn == 'submit') {
      this.triggerValidators();
      this.checkFormValidity().subscribe((isValid) => {
        if (isValid) this.preformSubmittion();
      });
    } else this.preformSubmittion();
  }
  preformSubmittion() {
    console.log(this.form.value, '--------------SUBMITTED------------------');
    this.initialFormValues = this.form.value;
    this.formDir.resetForm(this.form.value);
    this.submissionEmitter.emit(this.form.value); // Proceed with form submission }
  }
  onReset(e: Event) {
    e.preventDefault();
    this.formDir.resetForm(this.initialFormValues);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (Object.keys(changes?.['customValidators']?.currentValue || {}).length)
      this._addValidators = true;
  }
  private addValidatorsDynamically() {
    if (this._addValidators) {
      console.log('------------------------');
      this._addValidators = false;
      const customValidators = this.customValidators as CustomValidatorsType;
      setTimeout(() => {
        const currentConfig = this.jsonSubject.value;

        if (!!currentConfig && Object.keys(customValidators).length) {
          for (const key in customValidators) {
            const field = (this.form.controls as any)?.[key] as AbstractControl;
            if (field) {
              const { sync, async } = customValidators[key];
              this.validatorsObj[key] = () => {
                field?.addValidators(
                  resolveSyncValidators(
                    sync,
                    currentConfig.controls[key]?.validators || {}
                  )
                );
                field?.addAsyncValidators(resolveAsycValidators(async));
                field.updateValueAndValidity();
              };
            }
          }
        }
        if (this.form.updateOn !== 'submit') {
          this.triggerValidators();
        }
      }, 1000);
    }
  }
  syncValidators: () => void;
  asyncValidators: () => void;
  validatorsObj: any = {};
  addValidators() {}
  ngAfterViewChecked(): void {
    this.addValidatorsDynamically();
  }
}

function buildInitialFormValue(formData: Record<string, any>) {
  let initialValue = {};
  for (const key in formData) {
    const fieldValue = formData[key];
    if (typeof fieldValue == 'number')
      initialValue = { ...initialValue, [key]: 0 };
    else if (typeof fieldValue == 'string')
      initialValue = { ...initialValue, [key]: '' };
    else if (Array.isArray(fieldValue))
      initialValue = { ...initialValue, [key]: [] };
    else if (typeof fieldValue == 'object')
      initialValue = { ...initialValue, [key]: {} };
  }
  return initialValue;
}

function resolveSyncValidators(
  customSyncValidators: CustomValidatorsType[any]['sync'],
  jsonValidators: { [key: string]: unknown } | undefined = {}
) {
  let validatorsArray: any[] = [];
  if (customSyncValidators && Object.keys(customSyncValidators).length) {
    let sv = Array.isArray(customSyncValidators)
      ? customSyncValidators
      : [customSyncValidators];
    sv.forEach((customSync) => {
      validatorsArray.push(
        customSync.fnReturnedType === 'VF'
          ? customSync.fn(
              customSync.validatorParam || jsonValidators[customSync.fnName]
            )
          : customSync.fn
      );
    });
  }

  return validatorsArray;
}

function resolveAsycValidators(
  customAsyncValidators: CustomValidatorsType[any]['async'],
  jsonAsyncValidators: { [key: string]: unknown } = {}
) {
  if (customAsyncValidators && Object.keys(customAsyncValidators).length) {
    let av = Array.isArray(customAsyncValidators)
      ? customAsyncValidators
      : [customAsyncValidators];

    return av.map((customAsync) => {
      return customAsync.fnReturnedType === 'VF'
        ? customAsync.fn(
            customAsync.validatorParam ||
              jsonAsyncValidators[customAsync.fnName]
          )
        : (customAsync.fn as AsyncValidatorFn);
    });
  }
  return (_: AbstractControl) => of(null);
}
