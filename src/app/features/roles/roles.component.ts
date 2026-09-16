import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Access, Role, ModuleOption, ReturnRole } from './interfaces/roles.interfaces';
import { modulosAplicacion } from '../../../environments/environment';
import { GenericFormComponent } from '../../../shared/organisms/generic-form/generic-form.component';
import { GenericInputComponent } from '../../../shared/atoms/generic-input/generic-input.component';
import { GenericCheckboxComponent } from '../../../shared/atoms/generic-checkbox/generic-checkbox.component';
import { GenericButtonComponent } from '../../../shared/atoms/generic-button/generic-button.component';
import { GenericSelectComponent } from '../../../shared/atoms/generic-select/generic-select.component';
import { RolesService } from './services/roles.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-roles',
  imports: [DatePipe, GenericFormComponent, GenericInputComponent, GenericCheckboxComponent, GenericButtonComponent, GenericSelectComponent, ReactiveFormsModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css'
})
export class RolesComponent {

  private readonly roleServices: RolesService = inject(RolesService);
  visibilityTablet = false;
  viewRoles: ReturnRole[] = []

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  roleForm!: FormGroup;
  loading = false;

  moduleOptions: ModuleOption[] = [];

  ngOnInit(): void {
    this.getRoles();
    this.moduleOptions = modulosAplicacion;
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      permissionsFull: [false],
      modulesFull: [false],
      isActive: [true],
      accesos: this.fb.array([this.createAccesoGroup()]),
    });
  }

  get accesos(): FormArray {
    return this.roleForm.get('accesos') as FormArray;
  }

  createAccesoGroup(): FormGroup {
    return this.fb.group({
      modulo: [null, Validators.required],
      crear: [false],
      editar: [false],
      leer: [false],
    });
  }

  addAcceso(): void {
    this.accesos.push(this.createAccesoGroup());
  }

  removeAcceso(index: number): void {
    if (this.accesos.length > 1) {
      this.accesos.removeAt(index);
    }
  }

  private buildAccesosPayload(): Access[] {
    return this.accesos.controls.map((group) => {
      const value = group.value;
      const acciones: string[] = [];

      if (value.crear) acciones.push('crear');
      if (value.editar) acciones.push('editar');
      if (value.leer) acciones.push('leer');

      return { modulo: value.modulo, acciones };
    });
  }

  getRoles(): void {
    this.roleServices.getRoles().subscribe({
      next: (roles) => {

        this.viewRoles = roles;
      }
    });
  }
  onSubmit(): void {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    const payload: Role = {
      name: this.roleForm.value.name,
      description: this.roleForm.value.description,
      permissionsFull: this.roleForm.value.permissionsFull,
      modulesFull: this.roleForm.value.modulesFull,
      isActive: this.roleForm.value.isActive,
      accesos: this.roleForm.value.modulesFull ? [] : this.buildAccesosPayload(),
    };

    this.roleServices.createRole(payload).subscribe({
      next: (response) => {
        this.roleForm.reset({
          name: '',
          description: '',
          permissionsFull: false,
          modulesFull: false,
          isActive: true,
          accesos: [this.createAccesoGroup()],
        });
        this.getRoles();
      },

    });
  }


  renderFullAcceso(): boolean {
    const permissionsFull = this.roleForm.controls['permissionsFull'].value;
    const modulesFull = this.roleForm.controls['modulesFull'].value;

    if (permissionsFull && modulesFull) {
      this.roleForm.controls['accesos'].disable();
      return false;
    }
    return true;
  }

  visibilityAcceso(): boolean {
    const permissionsFull = this.roleForm.controls['permissionsFull'].value;
    const modulesFull = this.roleForm.controls['modulesFull'].value;
    if (permissionsFull && !modulesFull) {
      return false;
    }
    return true;
  }

  visibilityRoles(): boolean {
    this.visibilityTablet = !this.visibilityTablet;
    return this.visibilityTablet;
  }
  goBack(): void {
    this.router.navigate(['/roles']);
  }
}
