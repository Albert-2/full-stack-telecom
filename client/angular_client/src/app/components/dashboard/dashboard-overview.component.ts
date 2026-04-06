import { Component, inject, computed, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideCharts, BaseChartDirective } from 'ng2-charts';
import { AppStateService } from '../../services/app-state.service';
import { NetworkSimulationService } from '../../services/network-simulation.service';
import { DashboardDownloadRecommenderComponent } from './dashboard-download-recommender.component';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule, DashboardDownloadRecommenderComponent],
  providers: [provideCharts()],
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

      <!-- Live Speed & Latency Card -->
      <div class="card live-metrics-card">
        <div class="card-header">
          <span><i class="fas fa-tachometer-alt"></i> Live Network Performance</span>
        </div>
        <div class="metrics-grid">
          <div class="metric-item">
            <div class="metric-icon"><i class="fas fa-download"></i></div>
            <div class="metric-body">
              <div class="metric-label">Download</div>
              <div class="metric-value">{{ downloadSpeed() | number:'1.0-1' }} <span class="metric-unit">Mbps</span></div>
            </div>
          </div>
          <div class="metric-item">
            <div class="metric-icon"><i class="fas fa-upload"></i></div>
            <div class="metric-body">
              <div class="metric-label">Upload</div>
              <div class="metric-value">{{ uploadSpeed() | number:'1.0-1' }} <span class="metric-unit">Mbps</span></div>
            </div>
          </div>
          <div class="metric-item">
            <div class="metric-icon"><i class="fas fa-clock"></i></div>
            <div class="metric-body">
              <div class="metric-label">Latency</div>
              <div class="metric-value">{{ latency() | number:'1.0-0' }} <span class="metric-unit">ms</span></div>
            </div>
          </div>
          <div class="metric-item">
            <div class="metric-icon"><i class="fas fa-signal"></i></div>
            <div class="metric-body">
              <div class="metric-label">Signal</div>
              <div class="metric-value">{{ signalStrength() | number:'1.0-0' }}<span class="metric-unit">%</span></div>
              <div class="signal-bars">
                <div class="signal-bar" [class.active]="signalStrength() >= 20"></div>
                <div class="signal-bar" [class.active]="signalStrength() >= 40"></div>
                <div class="signal-bar" [class.active]="signalStrength() >= 60"></div>
                <div class="signal-bar" [class.active]="signalStrength() >= 80"></div>
                <div class="signal-bar" [class.active]="signalStrength() >= 100"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Download Window Recommender -->
      <app-dashboard-download-recommender></app-dashboard-download-recommender>

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
export class DashboardOverviewComponent implements OnInit, OnDestroy {
  appState = inject(AppStateService);
  networkService = inject(NetworkSimulationService);

  // Live metrics signals
  downloadSpeed = signal<number>(0);
  uploadSpeed = signal<number>(0);
  latency = signal<number>(0);
  signalStrength = signal<number>(0);
  chartRefresh = signal<number>(0);

  private updateInterval: any;

  // Chart data
  trafficChartData = signal<any>({
    labels: [],
    datasets: [
      {
        label: '5G Traffic (GB)',
        data: [],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.35)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: '#22c55e',
        pointBorderColor: '#16a34a',
        pointBorderWidth: 1
      },
      {
        label: '4G Traffic (GB)',
        data: [],
        borderColor: '#fb923c',
        backgroundColor: 'rgba(251, 146, 60, 0.35)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: '#fb923c',
        pointBorderColor: '#f97316',
        pointBorderWidth: 1
      }
    ]
  });

  trafficChartOptions = signal<any>({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      filler: {
        propagate: true
      },
      legend: {
        labels: {
          color: '#cbd5e1',
          font: { size: 11, weight: 600 },
          padding: 12
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#94a3b8',
          font: { size: 10 }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        }
      },
      y: {
        ticks: {
          color: '#94a3b8',
          font: { size: 10 }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        }
      }
    }
  });

  ngOnInit() {
    this.initializeTrafficChart();
    this.updateLiveMetrics();
    this.updateInterval = setInterval(() => {
      this.updateLiveMetrics();
      this.updateTrafficChart();
    }, 2000);
  }

  ngOnDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  private updateLiveMetrics() {
    // Simulate live network metrics based on current network
    const network = this.appState.currentNetwork();
    if (network === '5G') {
      this.downloadSpeed.set(150 + Math.random() * 100); // 150-250 Mbps
      this.uploadSpeed.set(50 + Math.random() * 50); // 50-100 Mbps
      this.latency.set(10 + Math.random() * 20); // 10-30 ms
      this.signalStrength.set(70 + Math.random() * 30); // 70-100%
    } else if (network === '4G') {
      this.downloadSpeed.set(20 + Math.random() * 30); // 20-50 Mbps
      this.uploadSpeed.set(5 + Math.random() * 15); // 5-20 Mbps
      this.latency.set(30 + Math.random() * 40); // 30-70 ms
      this.signalStrength.set(50 + Math.random() * 40); // 50-90%
    } else {
      this.downloadSpeed.set(0);
      this.uploadSpeed.set(0);
      this.latency.set(0);
      this.signalStrength.set(0);
    }
  }

  private initializeTrafficChart() {
    const labels = [];
    const data5g = [];
    const data4g = [];

    // Generate 24 hours of baseline data
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0') + ':00';
      labels.push(hour);

      // Simulate realistic traffic patterns
      // Peak hours: 8-10, 12-14, 18-20
      let base5g = 2 + Math.random() * 3; // Base 2-5 GB
      let base4g = 1 + Math.random() * 2; // Base 1-3 GB

      if ((i >= 8 && i <= 10) || (i >= 12 && i <= 14) || (i >= 18 && i <= 20)) {
        base5g *= 2 + Math.random(); // Peak multiplier
        base4g *= 1.5 + Math.random() * 0.5;
      }

      data5g.push(base5g);
      data4g.push(base4g);
    }

    this.trafficChartData.set({
      ...this.trafficChartData(),
      labels,
      datasets: [
        { ...this.trafficChartData().datasets[0], data: data5g },
        { ...this.trafficChartData().datasets[1], data: data4g }
      ]
    });
    
    // Trigger refresh
    this.chartRefresh.set(1);
  }

  private updateTrafficChart() {
    const currentHour = new Date().getHours();
    const currentData = { ...this.trafficChartData() };

    // Update current hour's data point
    const index = currentHour;
    if (index < currentData.datasets[0].data.length) {
      // Add some live variation
      const variation5g = (Math.random() - 0.5) * 0.5; // +/- 0.25
      const variation4g = (Math.random() - 0.5) * 0.3; // +/- 0.15

      currentData.datasets[0].data[index] += variation5g;
      currentData.datasets[1].data[index] += variation4g;

      // Keep within reasonable bounds
      currentData.datasets[0].data[index] = Math.max(0.5, currentData.datasets[0].data[index]);
      currentData.datasets[1].data[index] = Math.max(0.2, currentData.datasets[1].data[index]);

      // Create a new object to trigger change detection
      this.trafficChartData.set({
        labels: currentData.labels,
        datasets: [
          { ...currentData.datasets[0], data: [...currentData.datasets[0].data] },
          { ...currentData.datasets[1], data: [...currentData.datasets[1].data] }
        ]
      });
      
      // Trigger chart refresh
      this.chartRefresh.set(this.chartRefresh() + 1);
    }
  }

  format5gData = computed(() => this.networkService.formatMB(this.appState.used5g()));
  format4gData = computed(() => this.networkService.formatMB(this.appState.used4g()));
  formatRemaining = computed(() =>
    this.networkService.formatMB(this.networkService.getQuotaRemaining()),
  );
  quotaPercent = computed(() => Math.round(this.networkService.getQuotaPercentage()));
}
