import { CommonModule } from '@angular/common';
import { Component, Input, input } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { FormErrorFormatterPipe } from '../../pipes/form-error-formatter.pipe';

@Component({
  selector: 'app-form-error',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormErrorFormatterPipe],
  templateUrl: './form-error.component.html',
  styleUrl: './form-error.component.css',
})
export class FormErrorComponent {
  @Input({ required: true }) control?: AbstractControl;
}
