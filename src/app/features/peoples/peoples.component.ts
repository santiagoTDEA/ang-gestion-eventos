import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PeoplesService } from './services/peoples.service';
import { FacultyService } from '../faculty/services/faculty.service';
import { RolesService } from '../roles/services/roles.service';
import { CreatePersonDto, Faculty, Person } from './interfaces/people.interfaces';
import { ReturnFaculty } from '../faculty/interfaces/faculty.interfaces';
import { ReturnRole, Role } from '../roles/interfaces/roles.interfaces';
import { Status } from '../../core/interfaces/status.interfaces';
import { GenericButtonComponent } from '../../../shared/atoms/generic-button/generic-button.component';
import { GenericSelectComponent } from '../../../shared/atoms/generic-select/generic-select.component';
import { GenericInputComponent } from '../../../shared/atoms/generic-input/generic-input.component';
import { GenericFormComponent } from '../../../shared/organisms/generic-form/generic-form.component';
import { StatusService } from '../../core/services/status.service';


@Component({
  selector: 'app-peoples',
 imports: [ReactiveFormsModule, GenericFormComponent, GenericInputComponent, GenericSelectComponent, GenericButtonComponent], 
  templateUrl: './peoples.component.html',
  styleUrl: './peoples.component.css'
})
export class PeoplesComponent {
  private readonly peoplesService: PeoplesService = inject(PeoplesService);
  private readonly facultiesService: FacultyService = inject(FacultyService);
  private readonly rolesService: RolesService = inject(RolesService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly statusServices: StatusService = inject(StatusService);

  persons: Person[] = [];
  visibilityTablet = false;
  loading = false;
  updateMethod = false;
  currentPersonId: number | null = null;

  personForm!: FormGroup;

  facultyOptions: Faculty[] = [];
  roleOptions: ReturnRole[] = [];

  statusOptions: Status[] = [];

  ngOnInit(): void {
    this.getPersons();
    this.getFaculties();
    this.getRoles();
    this.getStatusOptions();
    this.buildForm();
  }

  private buildForm(): void {
    this.personForm = this.fb.group({
      cedula: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(10), Validators.pattern(/^\d+$/)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      phone: ['', [Validators.required, Validators.maxLength(20)]],
      address: ['', [Validators.required, Validators.maxLength(200)]],
      facultyId: [null, Validators.required],
      roleId: [null, Validators.required],
      statusId: [null, Validators.required],
    });
  }

  private getStatusOptions(): void {
    this.statusServices.getStatusOptions().subscribe({
      next: (statuses) => {
        if (statuses.length === 0) return
        this.statusOptions = statuses.filter(status => status.statusName.trim().toLowerCase() === "activo" || status.statusName.trim().toLowerCase() === "inactivo");
      },

    });


  }

  getPersons(): void {
    this.peoplesService.getPeoples().subscribe({
      next: (response: Person[]) => {
        this.persons = response;
      },
      error: (err) => console.error(err),
    });
  }

  getFaculties(): void {
    this.facultiesService.getFaculties().subscribe({
      next: (response: ReturnFaculty[]) => {
        this.facultyOptions = response;
      },
      error: (err) => console.error(err),
    });
  }

  getRoles(): void {
    this.rolesService.getRoles().subscribe({
      next: (response: ReturnRole[]) => {
        this.roleOptions = response;
      },
      error: (err) => console.error(err),
    });
  }

  visibilityRoles(): void {
    this.visibilityTablet = !this.visibilityTablet;
    if (this.visibilityTablet) {
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.updateMethod = false;
    this.currentPersonId = null;
    this.personForm.reset({
      cedula: '',
      email: '',
      phone: '',
      address: '',
      facultyId: null,
      roleId: null,
      statusId: null,
    });
  }

  obtenerDatos(item: Person): void {
    this.updateMethod = true;
    this.currentPersonId = item.id;

    this.personForm.patchValue({
      cedula: item.cedula,
      email: item.email,
      phone: item.phone,
      address: item.address,
      facultyId: item.faculty?.id ?? null,
      roleId: item.role?.id ?? null,
      statusId: item.status?.idStatus ?? null,
    });

    this.visibilityTablet = false;
  }

  onSubmit(formValue: CreatePersonDto): void {
    if (this.personForm.invalid) {
      this.personForm.markAllAsTouched();
      return;
    }

    if (this.updateMethod && this.currentPersonId !== null) {
      this.peoplesService.updatePeople(String(this.currentPersonId), formValue).subscribe({
        next: () => {
          this.getPersons();
          this.resetForm();
          this.visibilityTablet = true;
        },
        error: (err) => console.error(err),
      });
    } else {
      this.peoplesService.postPeople(formValue).subscribe({
        next: () => {
          this.getPersons();
          this.resetForm();
          this.visibilityTablet = true;
        },
        error: (err) => console.error(err),
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/inicio']);
  }
}