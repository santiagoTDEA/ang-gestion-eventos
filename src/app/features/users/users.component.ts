import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from './services/users.service';
import { CreateUserDto, UserResponse, Status } from './interfaces/users.interfaces';
import { GenericFormComponent } from '../../../shared/organisms/generic-form/generic-form.component';
import { GenericInputComponent, GenericInputIcon } from '../../../shared/atoms/generic-input/generic-input.component';
import { GenericSelectComponent } from '../../../shared/atoms/generic-select/generic-select.component';
import { GenericButtonComponent } from '../../../shared/atoms/generic-button/generic-button.component';
import { StatusService } from '../../core/services/status.service';
import { PeoplesService } from '../peoples/services/peoples.service';

@Component({
  selector: 'app-users',
  imports: [ReactiveFormsModule, GenericFormComponent, GenericInputComponent, GenericSelectComponent, GenericButtonComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {

  private readonly usersService: UsersService = inject(UsersService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly statusServices: StatusService = inject(StatusService);
  private readonly peopleService: PeoplesService = inject(PeoplesService);
  users: UserResponse[] = [];
  visibilityTablet = false;
  loading = false;
  updateMethod = false;
  currentUserId: string | null = null;
  typePassword: 'text' | 'password' = 'password';
  iconoPassword: GenericInputIcon = 'eye';


  userForm!: FormGroup;
  personOptions: { id: number; label: string }[] = [];

  statusOptions: Status[] = [];

  ngOnInit(): void {
    this.getUsers();
    this.getStatusOptions();
    this.getPeopleOptions();
    this.buildForm();
  }

  private getStatusOptions(): void {
    this.statusServices.getStatusOptions().subscribe({
      next: (statuses) => {
        if (statuses.length === 0) return
        this.statusOptions = statuses.filter(status => status.statusName.trim().toLowerCase() === "activo" || status.statusName.trim().toLowerCase() === "inactivo");
      },

    });


  }

  handleClick(): void {
    this.iconoPassword = (this.typePassword === 'password' ? 'eye' : 'eye-slash') as GenericInputIcon;
    this.typePassword = this.typePassword === 'password' ? 'text' : 'password';
  }

  private getPeopleOptions(): void {
    this.peopleService.getPeoples().subscribe({
      next: (people) => {
        console.log(people);
        if (people.length === 0) return;
        this.personOptions = people.filter(person => {
          return person.user.id == null;
        }).map(person => {
          return { id: person.id, label: person.email };
        });
      }
    });
  }

  private buildForm(): void {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      password: ['', [Validators.minLength(6), Validators.maxLength(100)]],
      personId: [null],
      statusId: [null, Validators.required],
    });
  }


  getUsers(): void {
    this.usersService.getUsers().subscribe({
      next: (response: UserResponse[]) => {
        this.users = response;
      }
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
    this.currentUserId = null;
    this.userForm.reset({
      username: '',
      password: '',
      personId: null,
      statusId: null,
    });
    this.userForm.get('password')?.addValidators(Validators.required);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  obtenerDatos(item: UserResponse): void {
    this.updateMethod = true;
    this.currentUserId = item.id;

    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.setValidators([Validators.minLength(6), Validators.maxLength(100)]);
    this.userForm.get('password')?.updateValueAndValidity();

    this.userForm.patchValue({
      username: item.username,
      password: '',
      personId: item.person?.id ?? null,
      statusId: item.status?.idStatus ?? null,
    });

    this.visibilityTablet = false;
  }

  onSubmit(formValue: CreateUserDto): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const payload: CreateUserDto = {
      username: formValue.username,
      password: formValue.password,
      personId: formValue.personId,
      statusId: formValue.statusId,
    };

    if (this.updateMethod && this.currentUserId) {
      this.usersService.updateUser(this.currentUserId, payload).subscribe({
        next: () => {
          this.getUsers();
          this.visibilityTablet = true;
          this.resetForm();
        },
        error: (err) => console.error(err),
      });
    } else {
      this.usersService.postUser(payload).subscribe({
        next: () => {
          this.getUsers();
          this.visibilityTablet = true;
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