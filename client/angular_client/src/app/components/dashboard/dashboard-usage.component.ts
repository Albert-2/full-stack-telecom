import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../services/app-state.service';
import { NetworkSimulationService } from '../../services/network-simulation.service';

@Component({
  selector: 'app-dashboard-usage',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="section active">
      <div class="card">
        <div class="card-header">
          <span><i class="fas fa-chart-line"></i> Usage History (Last 10 Events)</span>
        </div>
        <div class="table-wrap">
          <table class="usage-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Time</th>
                <th>Network</th>
                <th>Activity (Simulated)</th>
                <th>Data (MB)</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="appState.events().length === 0">
                <td colspan="7" class="empty-row">No history yet.</td>
              </tr>
              <tr *ngFor="let event of getRecentEvents(); let i = index">
                <td>{{ i + 1 }}</td>
                <td>{{ event.time }}</td>
                <td>
                  <span class="chip" [ngClass]="event.net === '5G' ? 'chip-5g' : 'chip-4g'">{{
                    event.net
                  }}</span>
                </td>
                <td>{{ event.app }}</td>
                <td>{{ event.data.toFixed(1) }}</td>
                <td>{{ event.lat.toFixed(4) }}, {{ event.lng.toFixed(4) }}</td>
                <td>
                  <span class="chip" [ngClass]="event.net === '5G' ? 'chip-ok' : 'chip-warn'">
                    {{ event.net === '5G' ? 'Free' : 'Quota' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span><i class="fas fa-chart-pie"></i> Session Summary</span>
        </div>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="sum-label">Total Events</span>
            <span class="sum-val">{{ appState.events().length }}</span>
          </div>
          <div class="summary-item">
            <span class="sum-label">5G Events</span>
            <span class="sum-val green">{{ count5gEvents() }}</span>
          </div>
          <div class="summary-item">
            <span class="sum-label">4G Events</span>
            <span class="sum-val orange">{{ count4gEvents() }}</span>
          </div>
          <div class="summary-item">
            <span class="sum-label">Fallbacks</span>
            <span class="sum-val red">{{ countFallbacks() }}</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './dashboard-usage.css',
})
export class DashboardUsageComponent {
  appState = inject(AppStateService);

  getRecentEvents() {
    return this.appState.events().slice(-10).reverse();
  }

  count5gEvents = computed(() => this.appState.events().filter((e) => e.net === '5G').length);
  count4gEvents = computed(() => this.appState.events().filter((e) => e.net === '4G').length);
  countFallbacks = computed(() => this.appState.alerts().filter((a) => a.type === 'a-4g').length);
}
