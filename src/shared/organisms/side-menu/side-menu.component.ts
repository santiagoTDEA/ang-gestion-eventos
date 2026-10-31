import { Component, Input, OnChanges, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { modulosAplicacion } from '../../../environments/environment';
import { JwtService } from '../../../app/core/services/jwt.service';
import { Role } from '../../../app/features/inicio/interfaces/inicio.interfaces';
import { ValidateRenderingService } from '../../../app/features/inicio/services/validate-rendering.service';
import { ModuleOption } from '../../../app/features/roles/interfaces/roles.interfaces';

interface MenuGroup {
  label: string;
  modules: string[];
}

interface MenuEntry {
  number: string;
  label: string;
  path: string;
}

interface MenuSection {
  label: string;
  items: MenuEntry[];
  shortLabel: string;
}

/** Cómo se agrupan los módulos en el menú. Los módulos que no estén aquí caen en "Otros". */
const MENU_GROUPS: MenuGroup[] = [
  { label: 'Gestión de eventos', modules: ['eventos', 'aprobaciones', 'difusion'] },
  { label: 'Administración', modules: ['facultades', 'personas', 'usuarios', 'roles', 'estados'] }
];

/**
 * Menú lateral. Muestra los mismos módulos que la pantalla de inicio: los que
 * el rol del token puede ver (permisos y módulos completos pasan a todos).
 */
@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.css'
})
export class SideMenuComponent implements OnChanges {
  private readonly jwtService = inject(JwtService);
  private readonly validateRenderingService = inject(ValidateRenderingService);

  @Input() routerUrl = '';

  sections: MenuSection[] = [];

  ngOnChanges(): void {
    this.sections = this.buildSections();
  }

  get currentPath(): string {
    return this.routerUrl.split('?')[0];
  }

  isActive(path: string): boolean {
    return this.currentPath === path || this.currentPath.startsWith(`${path}/`);
  }

  private buildSections(): MenuSection[] {
    const token = localStorage.getItem('accessToken');
    const role = token ? (this.jwtService.cargarDesdeToken(token) as Role | null) : null;
    const allowed = this.validateRenderingService.validateRendering(role, modulosAplicacion);

    const grouped = MENU_GROUPS.map(group => ({
      label: group.label,
      modules: group.modules
        .map(value => allowed.find(module => module.value === value))
        .filter((module): module is ModuleOption => !!module)
    }));

    const known = MENU_GROUPS.flatMap(group => group.modules);
    const others = allowed.filter(module => !known.includes(module.value));
    if (others.length > 0) {
      grouped.push({ label: 'Otros', modules: others });
    }

    let counter = 0;
    return grouped
      .filter(group => group.modules.length > 0)
      .map(group => ({
        label: group.label,
        shortLabel: group.label
          .split(/\s+/)
          .filter(Boolean)
          .map(word => word[0])
          .join('')
          .slice(0, 3)
          .toUpperCase(),
        items: group.modules.map(module => ({
          number: String(++counter).padStart(2, '0'),
          label: module.label,
          path: `/${module.value.toLowerCase()}`
        }))
      }));
  }
}
