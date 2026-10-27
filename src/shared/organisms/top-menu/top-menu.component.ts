import { Component, HostListener, OnChanges, OnDestroy, OnInit, inject, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AppNotification, NotificationsService } from '../../../app/core/services/notifications.service';

interface MenuItem {
  label: string;
  path: string;
  keywords: string;
}

@Component({
  selector: 'app-top-menu',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './top-menu.component.html',
  styleUrl: './top-menu.component.css'
})
export class TopMenuComponent implements OnInit, OnChanges, OnDestroy {
  private readonly router = inject(Router);
  private readonly notificationsService = inject(NotificationsService);
  private refreshTimer?: ReturnType<typeof setInterval>;
  @Input() routerUrl: string = '';
  searchTerm = '';
  showNotifications = false;
  showUserMenu = false;
  notifications: AppNotification[] = [];
  unreadCount = 0;

  readonly menuItems: MenuItem[] = [
    { label: 'Inicio', path: '/inicio', keywords: 'inicio módulos principal' },
    { label: 'Eventos', path: '/eventos', keywords: 'eventos evento actividad' },
    { label: 'Facultades', path: '/facultades', keywords: 'facultades facultad' },
    { label: 'Roles', path: '/roles', keywords: 'roles permisos' },
    { label: 'Usuarios', path: '/usuarios', keywords: 'usuarios usuario cuentas' },
    { label: 'Personas', path: '/personas', keywords: 'personas persona docentes' },
    { label: 'Estados', path: '/estados', keywords: 'estados estado' }
  ];

  ngOnInit(): void {
    this.loadNotifications();
    this.refreshTimer = setInterval(() => this.loadNotifications(), 60000);
  }

  /** Al cambiar de ruta se vuelven a consultar las notificaciones del usuario. */
  ngOnChanges(): void {
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    clearInterval(this.refreshTimer);
  }

  /** Nombre del módulo que se muestra en la barra superior. */
  get moduleTitle(): string {
    const module = this.routerUrl.split('?')[0].split('/')[1];
    return !module || module === 'inicio' ? 'Panel general' : `Gestión de ${module}`;
  }

  loadNotifications(): void {
    if (!localStorage.getItem('accessToken')) {
      return;
    }

    this.notificationsService.getMine().subscribe({
      next: ({ items, unread }) => {
        this.notifications = items;
        this.unreadCount = unread;
      },
      error: () => {
        // Sin notificaciones por ahora: la campana queda como estaba.
      }
    });
  }

  /** Abre la notificación: la marca como leída y lleva al evento en Aprobaciones. */
  openNotification(item: AppNotification): void {
    this.showNotifications = false;

    if (!item.read) {
      item.read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.notificationsService.markRead(item.id).subscribe({ error: () => this.loadNotifications() });
    }

    this.router.navigate(['/aprobaciones'], { queryParams: { evento: item.eventId } });
  }

  markAllRead(): void {
    this.notifications.forEach(item => (item.read = true));
    this.unreadCount = 0;
    this.notificationsService.markAllRead().subscribe({ error: () => this.loadNotifications() });
  }

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
