import { Component, inject, OnInit } from '@angular/core';
import { ValidateRenderingService } from './services/validate-rendering.service';
import { JwtService } from '../../core/services/jwt.service';
import { Modulo, Role } from './interfaces/inicio.interfaces';


@Component({
  selector: 'app-inicio',
  imports: [],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {

  private readonly validateRenderingService: ValidateRenderingService = inject(ValidateRenderingService);
  private readonly jwtServices: JwtService = inject(JwtService);

  modulos: Modulo[] = [
    { nombre: 'Facultades', icono: '🏛️' },
    { nombre: 'Usuarios', icono: '👤' },
    // { nombre: 'Inventario', icono: '📦' },
    // { nombre: 'Ventas', icono: '💰' },
    // { nombre: 'Reportes', icono: '📊' },
    // { nombre: 'Ajustes', icono: '⚙️' },
    // { nombre: 'Soporte', icono: '🛟' }
  ];

  modulosRenderizados: Modulo[] = [];

  ngOnInit(): void {
    const token = localStorage.getItem('accessToken');
    if (!token) return
    const Roles = this.jwtServices.cargarDesdeToken(token) as Role | null;
    const resultadoModulos = this.validateRenderingService.validateRendering(Roles, this.modulos);
    this.modulosRenderizados = [...resultadoModulos];
  }

  seleccionarModulo(modulo: Modulo): void {
    console.log('Módulo seleccionado:', modulo.nombre);
  }




}