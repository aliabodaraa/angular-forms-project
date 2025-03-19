import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { DynamicFormConfig } from './dynamic-forms/dynamic-forms.model';
import { HttpClient } from '@angular/common/http';
import { FactoryProvider, inject } from '@angular/core';

export const LIB_CONFIG = new InjectionToken<Observable<DynamicFormConfig>>(
  'LIB_CONFIG'
);

export function jsonFileProvider(path: string): FactoryProvider {
  return {
    provide: LIB_CONFIG,
    useFactory: () => inject(HttpClient).get<DynamicFormConfig>(path),
  };
}
