import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StatusService } from './services/status.service';
import { CreateStatusDto, Status } from './interfaces/status.interfaces';
import { GenericFormComponent } from '../../../shared/organisms/generic-form/generic-form.component';
import { GenericInputComponent } from '../../../shared/atoms/generic-input/generic-input.component';
import { GenericButtonComponent } from '../../../shared/atoms/generic-button/generic-button.component';

@Component({
  selector: 'app-status',
  imports: [ReactiveFormsModule, GenericFormComponent, GenericInputComponent, GenericButtonComponent],
  templateUrl: './status.component.html',
  styleUrl: './status.component.css'
})
export class StatusComponent implements OnInit {

  private readonly statusService: StatusService = inject(StatusService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  statuses: Status[] = [];
  loading = false;
  updateMethod = false;
  currentStatusId: number | null = null;

  statusForm!: FormGroup;

  ngOnInit(): void {
    this.getStatuses();
    this.buildForm();
  }

  private buildForm(): void {
    this.statusForm = this.fb.group({
      statusName: ['', [Validators.required, Validators.maxLength(50)]],
    });
  }

  getStatuses(): void {
    this.statusService.getStatuses().subscribe({
      next: (response: Status[]) => {
        this.statuses = response;
      },
      error: (err) => console.error(err),
    });
  }

  private resetForm(): void {
    this.updateMethod = false;
    this.currentStatusId = null;
    this.statusForm.reset({
      statusName: '',
    });
  }

  obtenerDatos(item: Status): void {
    this.updateMethod = true;
    this.currentStatusId = item.idStatus;

    this.statusForm.patchValue({
      statusName: item.statusName,
    });
  }

  onSubmit(formValue: CreateStatusDto): void {
    if (this.statusForm.invalid) {
      this.statusForm.markAllAsTouched();
      return;
    }

    if (this.updateMethod && this.currentStatusId !== null) {
      this.statusService.updateStatus(this.currentStatusId, formValue).subscribe({
        next: () => {
          this.getStatuses();
          this.resetForm();
        },
        error: (err) => console.error(err),
      });
    } else {
      this.statusService.postStatus(formValue).subscribe({
        next: () => {
          this.getStatuses();
          this.resetForm();
        },
        error: (err) => console.error(err),
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/inicio']);
  }
}