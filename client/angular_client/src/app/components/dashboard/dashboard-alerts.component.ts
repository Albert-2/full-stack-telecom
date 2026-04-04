import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-dashboard-alerts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="section active">
      <div class="card">
        <div class="card-header">
          <span><i class="fas fa-bell"></i> Alert Log</span>
          <button class="btn-clear" (click)="onClearAlerts()">Clear All</button>
        </div>
        <div class="alert-list">
          <div *ngIf="appState.alerts().length === 0" class="feed-empty">No alerts yet.</div>
          <div *ngFor="let alert of appState.alerts()" class="alert-item" [ngClass]="alert.type">
            <i class="fas alert-icon" [ngClass]="getAlertIcon(alert.type)"></i>
            <span class="alert-msg" [innerHTML]="alert.msg"></span>
            <span class="alert-time">{{ alert.time }}</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './dashboard-alerts.css',
})
export class DashboardAlertsComponent {
  appState = inject(AppStateService);

  onClearAlerts() {
    this.appState.clearAlerts();
  }

  getAlertIcon(type: string): string {
    const icons: Record<string, string> = {
      'a-5g': 'fa-check-circle',
      'a-4g': 'fa-exclamation-triangle',
      'a-warn': 'fa-exclamation-circle',
    };
    return icons[type] || 'fa-info-circle';
  }
}
