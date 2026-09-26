import { Component, HostListener, inject, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

interface MenuItem {
  label: string;
  path: string;
  keywords: string;
}

@Component({
  selector: 'app-top-menu',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './top-menu.component.html',
  styleUrl: './top-menu.component.css'
})
export class TopMenuComponent {
  private readonly router = inject(Router);
  @Input() routerUrl: string = '';
  searchTerm = '';
  showNotifications = false;
  showUserMenu = false;

  readonly menuItems: MenuItem[] = [
    { label: 'Inicio', path: '/inicio', keywords: 'inicio módulos principal' },
    { label: 'Eventos', path: '/eventos', keywords: 'eventos evento actividad' },
    { label: 'Facultades', path: '/facultades', keywords: 'facultades facultad' },
    { label: 'Roles', path: '/roles', keywords: 'roles permisos' },
    { label: 'Usuarios', path: '/usuarios', keywords: 'usuarios usuario cuentas' },
    { label: 'Personas', path: '/personas', keywords: 'personas persona docentes' },
    { label: 'Estados', path: '/estados', keywords: 'estados estado' }
  ];

  get filteredMenuItems(): MenuItem[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return [];
    }

    return this.menuItems.filter(item => item.keywords.includes(term));
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  goTo(path: string): void {
    this.router.navigateByUrl(path);
    this.searchTerm = '';
  }

  navigateToMatch(): void {
    const firstMatch = this.filteredMenuItems[0];
    if (firstMatch) {
      this.goTo(firstMatch.path);
    }
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false;
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    this.router.navigate(['/']);
  }

  @HostListener('document:click', ['$event'])
  closeMenus(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.top-menu__action-group')) {
      this.showNotifications = false;
      this.showUserMenu = false;
    }
  }
}