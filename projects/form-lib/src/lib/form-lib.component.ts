import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  contentChild,
  ContentChildren,
  ElementRef,
  inject,
  QueryList,
  TemplateRef,
  Type,
  ViewChild,
  ViewChildren,
  viewChildren,
} from '@angular/core';
import { LIB_CONFIG } from './lib-config';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DynamicControlResolver } from './dynamic-forms/dynamic-control-resolver.service';
import { ControlInjectorPipe } from './dynamic-forms/control-injector.pipe';
import { comparatorFn } from './dynamic-forms/dynamic-controls/base-dynamic-control';
import { RatingPickerComponent } from './rating-picker';

@Component({
  selector: 'lib-form',
  imports: [CommonModule, ReactiveFormsModule, ControlInjectorPipe],
  template: `
    <ng-container *ngIf="config$ | async as formConfig">
      <div class="dynamic-form-container">
        <form [formGroup]="form" (ngSubmit)="onSubmit(form)">
          <h3 class="form-heading">{{ formConfig.description }}</h3>
          <ng-container
            *ngFor="
              let control of formConfig.controls | keyvalue : comparatorFn
            "
          >
            <ng-container
              [ngComponentOutlet]="
                controlResolver.resolve(control.value.controlType) | async
              "
              [ngComponentOutletInjector]="
                control.key | controlInjector : control.value
              "
            ></ng-container>
          </ng-container>
          <ng-content></ng-content>

          <button [disabled]="form.invalid">Save</button>
        </form>
      </div>
    </ng-container>
    {{ form.value | json }}
  `,
  styles: ``,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormLibComponent {
  public config$ = inject(LIB_CONFIG);
  public form = new FormGroup({});
  protected controlResolver = inject(DynamicControlResolver);
  protected comparatorFn = comparatorFn;
  protected onSubmit(form: FormGroup) {
    console.log('Submitted data: ', form.value);
    form.reset();
  }
  @ContentChild('ratingPicker', { read: ElementRef })
  ratingPicker: ElementRef;

  ngAfterContentInit(): void {
    if (this.ratingPicker?.nativeElement)
      this.form.addControl(
        this.ratingPicker?.nativeElement.getAttribute('formControlName'),
        new FormControl('')
      );
  }
}
