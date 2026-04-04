import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../services/app-state.service';
import { NetworkSimulationService } from '../../services/network-simulation.service';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="section active">
      <div class="stats-grid">
        <div class="stat-card glow-blue">
          <div class="stat-icon"><i class="fas fa-signal"></i></div>
          <div class="stat-body">
            <div class="stat-label">Current Network</div>
            <div class="stat-value">{{ appState.currentNetwork() || '--' }}</div>
          </div>
        </div>
        <div class="stat-card glow-green">
          <div class="stat-icon"><i class="fas fa-infinity"></i></div>
          <div class="stat-body">
            <div class="stat-label">5G Data Used (Free)</div>
            <div class="stat-value">{{ format5gData() }}</div>
          </div>
        </div>
        <div class="stat-card glow-orange">
          <div class="stat-icon"><i class="fas fa-database"></i></div>
          <div class="stat-body">
            <div class="stat-label">4G Quota Used</div>
            <div class="stat-value">{{ format4gData() }}</div>
          </div>
        </div>
        <div class="stat-card glow-red">
          <div class="stat-icon"><i class="fas fa-shield-alt"></i></div>
          <div class="stat-body">
            <div class="stat-label">Quota Remaining</div>
            <div class="stat-value">{{ formatRemaining() }}</div>
          </div>
        </div>
      </div>

      <!-- Quota Bar -->
      <div class="card quota-card">
        <div class="card-header">
          <span><i class="fas fa-tachometer-alt"></i> Daily 4G Quota Guard</span>
          <span>{{ quotaPercent() }}%</span>
        </div>
        <div class="quota-bar-bg">
          <div
            class="quota-bar-fill"
            [style.width.%]="quotaPercent()"
            [class.danger]="quotaPercent() >= 70"
          ></div>
        </div>
        <div class="quota-labels"><span>0 MB</span><span>750 MB</span><span>1500 MB</span></div>
      </div>

      <!-- Live Event Feed -->
      <div class="card">
        <div class="card-header">
          <span><i class="fas fa-rss"></i> Live Network Event Feed</span>
        </div>
        <div class="event-feed">
          <div *ngIf="appState.events().length === 0" class="feed-empty">
            Waiting for network events...
          </div>
          <div
            *ngFor="let event of appState.events().slice().reverse().slice(0, 30)"
            class="feed-item"
            [ngClass]="event.net === '5G' ? 'f5g' : 'f4g'"
          >
            <span class="feed-tag" [ngClass]="event.net === '5G' ? 'tag-5g' : 'tag-4g'">{{
              event.net
            }}</span>
            <span class="feed-app">{{ event.app }}</span>
            <span class="feed-data">{{ event.data.toFixed(1) }} MB</span>
            <span class="feed-loc"><i class="fas fa-map-pin"></i> {{ event.lat.toFixed(4) }}, {{ event.lng.toFixed(4) }}</span>
            <span class="feed-time">{{ event.time }}</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './dashboard-overview.css',
})
export class DashboardOverviewComponent {
  appState = inject(AppStateService);
  networkService = inject(NetworkSimulationService);

  format5gData = computed(() => this.networkService.formatMB(this.appState.used5g()));
  format4gData = computed(() => this.networkService.formatMB(this.appState.used4g()));
  formatRemaining = computed(() =>
    this.networkService.formatMB(this.networkService.getQuotaRemaining()),
  );
  quotaPercent = computed(() => Math.round(this.networkService.getQuotaPercentage()));
}
