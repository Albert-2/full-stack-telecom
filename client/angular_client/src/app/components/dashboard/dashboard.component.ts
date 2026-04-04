import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../services/app-state.service';
import { AuthService } from '../../services/auth.service';
import { NetworkSimulationService } from '../../services/network-simulation.service';
import { DashboardOverviewComponent } from './dashboard-overview.component';
import { DashboardMapComponent } from './dashboard-map.component';
import { DashboardUsageComponent } from './dashboard-usage.component';
import { DashboardAlertsComponent } from './dashboard-alerts.component';
import { DashboardPlansComponent } from './dashboard-plans.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DashboardOverviewComponent,
    DashboardMapComponent,
    DashboardUsageComponent,
    DashboardAlertsComponent,
    DashboardPlansComponent
  ],
  template: `
    <div class="app-container">
      <!-- SIDEBAR -->
      <aside class="sidebar" [class.open]="sidebarOpen()">
        <div class="sidebar-logo">
          <span class="logo-icon"><i class="fas fa-broadcast-tower"></i></span>
          <span class="logo-text">NexGen<span class="accent">5G</span></span>
        </div>
        <nav class="sidebar-nav">
          <a
            href="#"
            class="nav-item"
            [class.active]="activeSection() === 'dashboard'"
            (click)="setSection('dashboard', $event)"
          >
            <i class="fas fa-tachometer-alt"></i><span>Dashboard</span>
          </a>
          <a
            href="#"
            class="nav-item"
            [class.active]="activeSection() === 'map'"
            (click)="setSection('map', $event)"
          >
            <i class="fas fa-map-marked-alt"></i><span>Signal Map</span>
          </a>
          <a
            href="#"
            class="nav-item"
            [class.active]="activeSection() === 'usage'"
            (click)="setSection('usage', $event)"
          >
            <i class="fas fa-chart-bar"></i><span>Usage History</span>
          </a>
          <a
            href="#"
            class="nav-item"
            [class.active]="activeSection() === 'alerts'"
            (click)="setSection('alerts', $event)"
          >
            <i class="fas fa-bell"></i><span>Alerts</span>
            <span class="badge">{{ appState.alertCount() }}</span>
          </a>
          <a
            href="#"
            class="nav-item"
            [class.active]="activeSection() === 'plans'"
            (click)="setSection('plans', $event)"
          >
            <i class="fas fa-sim-card"></i><span>Plan Advisor</span>
          </a>
        </nav>
        <div class="sidebar-footer">
          <div class="user-card">
            <div class="user-avatar"><i class="fas fa-user-astronaut"></i></div>
            <div class="user-info">
              <span class="user-name">{{ userDisplayName() }}</span>
              <span class="user-plan">{{ userStatus() }}</span>
            </div>
            <button class="user-logout" (click)="onLogout()" title="Logout">
              <i class="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <main class="main-content">
        <!-- TOP BAR -->
        <header class="topbar">
          <button class="menu-toggle" (click)="toggleSidebar()">
            <i class="fas fa-bars"></i>
          </button>
          <div class="topbar-title">{{ pageTitle() }}</div>
          <div class="topbar-right">
            <div class="signal-pill" [class]="'signal-' + (appState.currentNetwork() || 'unknown')">
              <span class="pulse-dot" [class]="'on' + (appState.currentNetwork() || '5G')"></span>
              <span>{{ signalLabel() }}</span>
            </div>
            <div class="clock">{{ currentTime() }}</div>
          </div>
        </header>

        <!-- TOAST ALERT -->
        <div class="toast" [class.show]="showToast()" [ngClass]="toastType()">
          {{ toastMessage() }}
        </div>

        <!-- SECTIONS -->
        <app-dashboard-overview *ngIf="activeSection() === 'dashboard'"></app-dashboard-overview>
        <app-dashboard-map *ngIf="activeSection() === 'map'"></app-dashboard-map>
        <app-dashboard-usage *ngIf="activeSection() === 'usage'"></app-dashboard-usage>
        <app-dashboard-alerts *ngIf="activeSection() === 'alerts'"></app-dashboard-alerts>
        <app-dashboard-plans *ngIf="activeSection() === 'plans'"></app-dashboard-plans>
      </main>
    </div>
  `,
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  appState = inject(AppStateService);
  authService = inject(AuthService);
  networkService = inject(NetworkSimulationService);

  activeSection = signal<string>('dashboard');
  sidebarOpen = signal<boolean>(false);
  pageTitle = computed(() => {
    const section = this.activeSection();
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      map: 'Signal Map',
      usage: 'Usage History',
      alerts: 'Alerts',
      plans: 'Plan Advisor',
    };
    return titles[section] || 'Dashboard';
  });

  currentTime = signal<string>('');
  showToast = signal<boolean>(false);
  toastMessage = signal<string>('');
  toastType = signal<string>('');

  userDisplayName = computed(() => {
    const user = this.appState.user();
    return user.isGuest ? 'Guest User' : user.email || 'Demo User';
  });

  userStatus = computed(() => {
    const user = this.appState.user();
    return user.isGuest ? '👤 Guest Access' : '✓ Logged In';
  });

  signalLabel = computed(() => {
    const net = this.appState.currentNetwork();
    return net === '5G' ? '5G Active' : net === '4G' ? '4G Fallback' : 'Detecting...';
  });

  private clockInterval: any;

  ngOnInit() {
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
    this.networkService.startSimulation();
  }

  ngOnDestroy() {
    if (this.clockInterval) clearInterval(this.clockInterval);
    this.networkService.stopSimulation();
  }

  setSection(section: string, event: Event) {
    event.preventDefault();
    this.activeSection.set(section);
    this.sidebarOpen.set(false);
  }

  toggleSidebar() {
    this.sidebarOpen.update((v) => !v);
  }

  onLogout() {
    this.authService.logout();
    this.networkService.stopSimulation();
    window.location.href = '/';
  }

  private updateClock() {
    const now = new Date();
    this.currentTime.set(now.toLocaleTimeString('en-IN', { hour12: false }));
  }
}
