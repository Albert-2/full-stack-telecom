import { Injectable, signal } from '@angular/core';
import { AppStateService, NetworkEvent, Alert } from './app-state.service';

@Injectable({
  providedIn: 'root',
})
export class NetworkSimulationService {
  private DAILY_QUOTA_MB = 1500;
  private SIMULATE_INTERVAL_MS = 4000;
  private APPS = ['YouTube', 'Netflix', 'Instagram', 'WhatsApp', 'Chrome', 'Hotstar', 'Spotify'];
  private LOCS = ['Home', 'Office', 'Mall', 'Metro', 'Cafe', 'Outdoor', 'Basement'];

  simulationRunning = signal<boolean>(false);
  private simulationInterval: any;

  constructor(private stateService: AppStateService) {}

  startSimulation() {
    if (this.simulationRunning()) return;
    this.simulationRunning.set(true);
    this.simulationInterval = setInterval(() => this.simulateEvent(), this.SIMULATE_INTERVAL_MS);
    // Simulate first event immediately
    this.simulateEvent();
  }

  stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }
    this.simulationRunning.set(false);
  }

  private simulateEvent() {
    const net = Math.random() < 0.6 ? ('5G' as const) : ('4G' as const);
    const app = this.APPS[Math.floor(Math.random() * this.APPS.length)];
    const data = +(Math.random() * 480 + 20).toFixed(1);

    // Generate random nearby coordinates (within 0.1 degrees = ~11km)
    const baseLat = this.stateService.userLat() || 20.5937;
    const baseLng = this.stateService.userLng() || 78.9629;
    const lat = +(baseLat + (Math.random() - 0.5) * 0.1).toFixed(4);
    const lng = +(baseLng + (Math.random() - 0.5) * 0.1).toFixed(4);

    const time = new Date().toLocaleTimeString('en-IN', { hour12: false });

    const event: NetworkEvent = { net, app, data, lat, lng, time };
    this.stateService.addEvent(event);
    this.stateService.updateNetworkStats(net, data);

    // Handle fallback and network changes
    const lastNet = this.stateService.lastNetwork();
    if (lastNet === '5G' && net === '4G') {
      this.playNotificationSound();
      this.stateService.addAlert({
        msg: `Fallback to 4G detected at <strong>${lat}, ${lng}</strong> while using <strong>${app}</strong>. ${data.toFixed(1)} MB deducted from quota.`,
        type: 'a-4g',
        time,
      });
    } else if (lastNet === '4G' && net === '5G') {
      this.stateService.addAlert({
        msg: `Restored to 5G at <strong>${lat}, ${lng}</strong>. Enjoy unlimited data!`,
        type: 'a-5g',
        time,
      });
    }

    // Quota warnings
    const used4gPct = (this.stateService.used4g() / this.DAILY_QUOTA_MB) * 100;
    if (used4gPct >= 90 && lastNet !== '4G_WARN90') {
      this.stateService.addAlert({
        msg: 'You have used <strong>90%</strong> of your daily 4G quota. Consider switching to Wi-Fi.',
        type: 'a-warn',
        time,
      });
      this.stateService.lastNetwork.set('4G_WARN90');
    } else if (used4gPct >= 75 && !this.stateService.warned75()) {
      this.stateService.addAlert({
        msg: 'You have used <strong>75%</strong> of your daily 4G quota.',
        type: 'a-warn',
        time,
      });
      this.stateService.warned75.set(true);
    }

    this.stateService.lastNetwork.set(net);
    this.stateService.currentNetwork.set(net);
  }

  private playNotificationSound() {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioContext.currentTime;

      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.connect(gain);
      gain.connect(audioContext.destination);

      // First beep
      osc.frequency.setValueAtTime(1000, now);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.start(now);
      osc.stop(now + 0.3);

      // Second beep
      osc.frequency.setValueAtTime(1200, now + 0.4);
      gain.gain.setValueAtTime(0.3, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

      osc.start(now + 0.4);
      osc.stop(now + 0.7);
    } catch (e) {
      console.log('Audio playback not available');
    }
  }

  formatMB(mb: number): string {
    return mb >= 1000 ? (mb / 1000).toFixed(2) + ' GB' : mb.toFixed(1) + ' MB';
  }

  getQuotaPercentage(): number {
    return Math.min(100, (this.stateService.used4g() / this.DAILY_QUOTA_MB) * 100);
  }

  getQuotaRemaining(): number {
    return Math.max(0, this.DAILY_QUOTA_MB - this.stateService.used4g());
  }
}
