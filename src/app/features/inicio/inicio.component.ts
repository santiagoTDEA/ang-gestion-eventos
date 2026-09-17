import { Component, inject, OnInit } from '@angular/core';
import { ValidateRenderingService } from './services/validate-rendering.service';
import { JwtService } from '../../core/services/jwt.service';
import {  Role } from './interfaces/inicio.interfaces';
import { Router } from '@angular/router';
import { modulosAplicacion } from '../../../environments/environment';
import { ModuleOption } from '../roles/interfaces/roles.interfaces';


@Component({
  selector: 'app-inicio',
  imports: [],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {

  private readonly validateRenderingService: ValidateRenderingService = inject(ValidateRenderingService);
  private readonly jwtServices: JwtService = inject(JwtService);
  private readonly router :Router = inject(Router)

  modulos: ModuleOption[] = modulosAplicacion
  
  modulosRenderizados: ModuleOption[] = [];

  ngOnInit(): void {
    const token = localStorage.getItem('accessToken');
    if (!token) return
    const Roles = this.jwtServices.cargarDesdeToken(token) as Role | null;
    const resultadoModulos = this.validateRenderingService.validateRendering(Roles, this.modulos);
    this.modulosRenderizados = [...resultadoModulos];
  }

  seleccionarModulo(modulo: ModuleOption): void {
    this.router.navigate([`/${modulo.value.toLowerCase()}`]);
  }




}