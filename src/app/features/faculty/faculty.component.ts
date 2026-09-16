import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FacultyService } from './services/faculty.service';
import { Faculty, ReturnFaculty } from './interfaces/faculty.interfaces';
import { GenericFormComponent } from '../../../shared/organisms/generic-form/generic-form.component';
import { GenericInputComponent } from '../../../shared/atoms/generic-input/generic-input.component';
import { GenericButtonComponent } from '../../../shared/atoms/generic-button/generic-button.component';
import { GenericSelectComponent } from '../../../shared/atoms/generic-select/generic-select.component';
import { StatusService } from '../../core/services/status.service';
import { Status } from '../../core/interfaces/status.interfaces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faculty',
  imports: [GenericFormComponent, GenericInputComponent, GenericButtonComponent, GenericSelectComponent, CommonModule],
  templateUrl: './faculty.component.html',
  styleUrl: './faculty.component.css'
})
export class FacultyComponent implements OnInit {

  facultyForm: FormGroup;
  loading = false;
  updateMethod: boolean = false;
  private readonly router: Router = inject(Router);
  private readonly facultyServices: FacultyService = inject(FacultyService);
  private readonly statusServices: StatusService = inject(StatusService);
  statusOptions: Status[] = []
  faculties: ReturnFaculty[] = [];
  id: number | null = null;
  constructor(private fb: FormBuilder) {
    this.facultyForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],

      department: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.maxLength(150),
        ],
      ],

      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{7,15}$/),
        ],
      ],

      statusId: [
        null,
        [
          Validators.required,
        ],
      ],
    });
  }


  ngOnInit(): void {
    this.statusServices.getStatusOptions().subscribe({
      next: (statuses) => {
        this.statusOptions = statuses;
      }
    });
    this.getFaculties();
  }



  createFaculty(facultyData: Faculty) {
    this.facultyServices.postCreateFaculty(facultyData).subscribe({
      next: (response) => {
        this.getFaculties();
        this.facultyForm.reset({
          name: '',
          department: '',
          email: '',
          phone: '',
          statusId: null
        })
      }

    });
  }

  obtenerDatos(facultades: ReturnFaculty): void {
    this.updateMethod = true;
    this.id = facultades.id;
    this.facultyForm.patchValue({
      name: facultades.name,
      department: facultades.department,
      email: facultades.email,
      phone: facultades.phone,
      statusId: facultades.status.idStatus
    });
  }

  getFaculties() {
    this.facultyServices.getFaculties().subscribe({
      next: (faculties) => {
        this.faculties = faculties;
      }
    });
  }

  goBack(): void {
   this.router.navigate(['/inicio']);
  }

  updateFaculty(formValue: any): void {
    if (this.facultyForm.invalid) return;
    this.facultyServices.updateFaculty({ ...this.facultyForm.getRawValue(), id: this.id }).subscribe({
      next: (response) => {
        this.getFaculties();
        this.facultyForm.reset({
          name: '',
          department: '',
          email: '',
          phone: '',
          statusId: null
        });
        this.updateMethod = false;
      }
    });

  }
  onSubmit(formValue: any): void {
    if (this.facultyForm.invalid) return;
    this.createFaculty(this.facultyForm.getRawValue());

  }

}
