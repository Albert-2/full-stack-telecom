import { Component, inject, computed, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../services/app-state.service';

interface HourScore {
  hour: number;
  timeLabel: string;
  score: number;
  color: string;
  barHeight: number;
  network: string;
  congestion: number;
  signal: number;
}

interface WindowRecommendation {
  type: 'best' | 'avoid' | 'next';
  startHour: number;
  endHour: number;
  timeRange: string;
  reason: string;
  color: string;
}

@Component({
  selector: 'app-dashboard-download-recommender',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card download-recommender-card">
      <div class="card-header">
        <span><i class="fas fa-cloud-download-alt"></i> Download Window Recommender</span>
      </div>

      <!-- Best Window Banner -->
      <div class="best-window-banner" [ngClass]="bestWindow().color === '#22c55e' ? 'banner-green' : 'banner-red'">
        <i class="fas fa-check-circle"></i>
        <span>{{ bestWindow().color === '#22c55e' ? '✓ Best time NOW' : '⚠ Check conditions' }} — {{ bestWindow().timeRange }}</span>
      </div>

      <!-- 12-Hour Bar Chart -->
      <div class="chart-bars">
        <div *ngFor="let hour of hourScores()" class="bar-wrapper">
          <div class="bar-container">
            <div 
              class="bar" 
              [style.height.%]="hour.barHeight"
              [style.backgroundColor]="hour.color"
              [title]="hour.timeLabel + ' - Score: ' + (hour.score | number:'1.0-0') + '/100'">
            </div>
          </div>
          <div class="bar-label">{{ hour.timeLabel }}</div>
        </div>
      </div>

      <!-- Recommendation Windows -->
      <div class="recommendations">
        <div *ngFor="let window of recommendations()" class="window-card" [ngClass]="'window-' + window.type">
          <div class="window-title">
            <i [ngClass]="window.type === 'best' ? 'fas fa-star' : window.type === 'avoid' ? 'fas fa-stop-circle' : 'fas fa-clock'"></i>
            {{ window.type === 'best' ? 'Best Window' : window.type === 'avoid' ? 'Avoid Window' : 'Next Good Window' }}
          </div>
          <div class="window-time">{{ window.timeRange }}</div>
          <div class="window-reason">{{ window.reason }}</div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './dashboard-download-recommender.css',
})
export class DashboardDownloadRecommenderComponent implements OnInit, OnDestroy {
  appState = inject(AppStateService);

  hourScores = signal<HourScore[]>([]);
  recommendations = signal<WindowRecommendation[]>([]);
  bestWindow = signal<WindowRecommendation>({
    type: 'best',
    startHour: 0,
    endHour: 1,
    timeRange: '00:00 - 01:00',
    reason: 'Excellent conditions',
    color: '#22c55e'
  });

  private updateInterval: any;

  ngOnInit() {
    this.calculateScores();
    this.updateInterval = setInterval(() => {
      this.calculateScores();
    }, 5000);
  }

  ngOnDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  private calculateScores() {
    const now = new Date();
    const currentHour = now.getHours();
    const scores: HourScore[] = [];

    for (let i = 0; i < 12; i++) {
      const hour = (currentHour + i) % 24;
      const nextDate = new Date(now);
      nextDate.setHours(hour, 0, 0, 0);
      if (hour < currentHour) nextDate.setDate(nextDate.getDate() + 1);

      // Get simulated values
      const network = this.appState.currentNetwork() || '5G';
      const congestion = this.getCongestionLevel(hour);
      const signal = 70 + Math.random() * 30; // 70-100%

      // Calculate score
      let score = 0;

      // Network contribution (40 points max)
      if (network === '5G') {
        score += 40;
      } else {
        score += 20;
      }

      // Congestion contribution (40 points max)
      score += (1 - congestion) * 40;

      // Signal contribution (20 points max)
      score += (signal / 100) * 20;

      // Determine color
      let color = '#22c55e'; // Green
      if (score < 40) {
        color = '#ef4444'; // Red
      } else if (score < 70) {
        color = '#f59e0b'; // Amber
      }

      const barHeight = (score / 100) * 100;

      const hourLabel = hour.toString().padStart(2, '0') + ':00';

      scores.push({
        hour,
        timeLabel: hourLabel,
        score,
        color,
        barHeight: Math.max(10, barHeight), // Minimum 10% for visibility
        network,
        congestion,
        signal
      });
    }

    this.hourScores.set(scores);
    this.generateRecommendations(scores);
  }

  private getCongestionLevel(hour: number): number {
    // Low at night (0-7), medium day (8-17), high peak (17-20), medium evening (20-24)
    if (hour >= 0 && hour < 7) return 0.2; // 20% - very low
    if (hour >= 7 && hour < 9) return 0.4; // 40% - low-medium
    if (hour >= 9 && hour < 17) return 0.5; // 50% - medium
    if (hour >= 17 && hour < 20) return 0.8; // 80% - high
    if (hour >= 20 && hour < 22) return 0.6; // 60% - medium-high
    return 0.3; // 30% - low
  }

  private generateRecommendations(scores: HourScore[]) {
    // Find best, worst, and next good windows
    let bestScore = -1;
    let bestStartHour = 0;
    let bestEndHour = 1;

    let worstScore = 101;
    let worstStartHour = 0;
    let worstEndHour = 1;

    let nextGoodScore = -1;
    let nextGoodStartHour = 0;
    let nextGoodEndHour = 1;

    for (let i = 0; i < scores.length; i++) {
      if (scores[i].score > bestScore) {
        bestScore = scores[i].score;
        bestStartHour = i;
        bestEndHour = Math.min(i + 2, scores.length - 1);
      }

      if (scores[i].score < worstScore) {
        worstScore = scores[i].score;
        worstStartHour = i;
        worstEndHour = Math.min(i + 1, scores.length - 1);
      }

      if (scores[i].score >= 70 && i > 0 && scores[i - 1].score < 70 && nextGoodScore === -1) {
        nextGoodScore = scores[i].score;
        nextGoodStartHour = i;
        nextGoodEndHour = Math.min(i + 2, scores.length - 1);
      }
    }

    const bestStartLabel = scores[bestStartHour].timeLabel;
    const bestEndLabel = scores[bestEndHour].timeLabel;
    const bestColor = scores[bestStartHour].score >= 70 ? '#22c55e' : '#f59e0b';

    const worstStartLabel = scores[worstStartHour].timeLabel;
    const worstEndLabel = scores[worstEndHour].timeLabel;

    const nextGoodLabel = nextGoodScore >= 0 ? scores[nextGoodStartHour].timeLabel : 'Later';

    this.bestWindow.set({
      type: 'best',
      startHour: bestStartHour,
      endHour: bestEndHour,
      timeRange: bestStartLabel + ' - ' + bestEndLabel,
      reason: `Score: ${(bestScore | 0)}/100 (${scores[bestStartHour].network})`,
      color: bestColor
    });

    this.recommendations.set([
      {
        type: 'best',
        startHour: bestStartHour,
        endHour: bestEndHour,
        timeRange: bestStartLabel + ' - ' + bestEndLabel,
        reason: `Score: ${(bestScore | 0)}/100 — ${scores[bestStartHour].network}`,
        color: '#22c55e'
      },
      {
        type: 'avoid',
        startHour: worstStartHour,
        endHour: worstEndHour,
        timeRange: worstStartLabel + ' - ' + worstEndLabel,
        reason: `Score: ${(worstScore | 0)}/100 — High congestion`,
        color: '#ef4444'
      },
      {
        type: 'next',
        startHour: nextGoodStartHour,
        endHour: nextGoodEndHour,
        timeRange: nextGoodLabel + ' onwards',
        reason: nextGoodScore >= 0 ? `Score: ${(nextGoodScore | 0)}/100` : 'Check back later',
        color: '#22c55e'
      }
    ]);
  }
}
