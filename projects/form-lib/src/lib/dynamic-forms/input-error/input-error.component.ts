import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule, KeyValue } from '@angular/common';
import { ValidationErrors } from '@angular/forms';
import { ErrorMessagePipe } from './error-message.pipe';

@Component({
  selector: 'app-input-error',
  standalone: true,
  imports: [CommonModule, ErrorMessagePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *ngIf="!isControlPending; else isPending">
      <div
        *ngFor="let error of errors | keyvalue; trackBy: trackByFn"
        class="input-error"
      >
        {{ error.key | errorMessage : error.value }}
      </div>
    </ng-container>
    <ng-template #isPending>
      <div class="input-error input-info">
        {{ 'checking' | errorMessage : true }}
      </div>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class InputErrorComponent {
  @Input()
  errors: ValidationErrors | undefined | null = null;
  @Input()
  isControlPending: boolean = false;
  trackByFn(index: number, item: KeyValue<string, any>) {
    return item.key;
  }
}
