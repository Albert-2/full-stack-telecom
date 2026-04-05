import { Component, OnInit, inject, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../services/app-state.service';

declare var L: any;

@Component({
  selector: 'app-dashboard-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="section active">
      <div class="card map-card">
        <div class="card-header">
          <span><i class="fas fa-map-marked-alt"></i> Global Signal Coverage Map</span>
          <div class="map-legend">
            <span class="legend-dot dot-5g"></span>5G Coverage <span class="legend-dot dot-4g"></span>4G
            Coverage <span class="legend-dot dot-you"></span>Your Location
          </div>
        </div>
        <div id="map" style="height: 500px; width: 100%; border-radius: 12px;"></div>
        <div class="map-info-bar">
          <i class="fas fa-location-crosshairs"></i>
          You are at: {{ appState.userLat()?.toFixed(4) }}, {{ appState.userLng()?.toFixed(4) }}
        </div>
      </div>

      <!-- Tower Status List -->
      <div class="card tower-status-card">
        <div class="card-header">
          <span><i class="fas fa-broadcast-tower"></i> Tower Status Overview</span>
        </div>
        <div class="tower-list">
          <div
            *ngFor="let tower of towers()"
            class="tower-item"
            [class]="getTowerClass(tower.type)"
            (click)="onTowerClick(tower)"
          >
            <div class="tower-header">
              <div class="tower-icon">
                <i class="fas fa-broadcast-tower"></i>
              </div>
              <div class="tower-info">
                <div class="tower-type">{{ tower.type }}</div>
                <div class="tower-sector">{{ tower.sector }} • {{ tower.band }}</div>
              </div>
              <div class="tower-status" [class]="getLoadClass(tower.load)">
                {{ tower.load }}%
              </div>
            </div>
            <div class="tower-details">
              <div class="tower-metric">
                <span class="metric-label">Users:</span>
                <span class="metric-value">{{ tower.users }}</span>
              </div>
              <div class="tower-metric">
                <span class="metric-label">Max Speed:</span>
                <span class="metric-value">{{ tower.maxSpeed }}</span>
              </div>
            </div>
            <div class="load-bar-container">
              <div class="load-bar-bg">
                <div
                  class="load-bar-fill"
                  [style.width.%]="tower.load"
                  [class]="getLoadClass(tower.load)"
                ></div>
              </div>
              <div class="load-label">{{ tower.load }}% Load</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './dashboard-map.css'
})
export class DashboardMapComponent implements OnInit, OnDestroy {
  appState = inject(AppStateService);
  towers = signal<any[]>([]);
  private map: any = null;
  private eventMarkers: any[] = [];
  private coverageCircles: any[] = [];
  private towerMarkers: any[] = [];

  ngOnInit() {
    this.initializeTowers();
    setTimeout(() => this.initMap(), 500);
  }

  private initializeTowers() {
    const towerData = [
      {
        id: 1,
        type: '5G NR',
        sector: 'Alpha',
        band: 'n78',
        load: 65,
        users: 234,
        maxSpeed: '1.2 Gbps'
      },
      {
        id: 2,
        type: 'LTE-A',
        sector: 'Beta',
        band: 'Band 3',
        load: 45,
        users: 156,
        maxSpeed: '150 Mbps'
      },
      {
        id: 3,
        type: '5G NR',
        sector: 'Gamma',
        band: 'n41',
        load: 78,
        users: 312,
        maxSpeed: '800 Mbps'
      },
      {
        id: 4,
        type: 'LTE',
        sector: 'Delta',
        band: 'Band 40',
        load: 32,
        users: 89,
        maxSpeed: '75 Mbps'
      },
      {
        id: 5,
        type: '5G NR',
        sector: 'Epsilon',
        band: 'mmWave',
        load: 55,
        users: 198,
        maxSpeed: '2.1 Gbps'
      }
    ];
    this.towers.set(towerData);
  }

  ngOnDestroy() {
    if (this.map) this.map.remove();
  }

  private initMap() {
    const lat = this.appState.userLat() || 20.5937;
    const lng = this.appState.userLng() || 78.9629;

    if (this.map) return;

    this.map = L.map('map').setView([lat, lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(this.map);

    // Add coverage zones as heatmap-like regions
    this.generateCoverageZones(lat, lng);

    // Add user marker
    this.placeUserMarker(lat, lng);

    // Add tower markers
    this.placeTowerMarkers(lat, lng);

    // Watch for new events and add markers
    setInterval(() => this.updateEventMarkers(), 2000);
  }

  private placeUserMarker(lat: number, lng: number) {
    const icon = L.divIcon({
      className: 'user-marker',
      html: '<i class="fas fa-circle" style="color: #0066cc; font-size: 20px; filter: drop-shadow(0 0 6px #0066cc);"></i>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    L.marker([lat, lng], { icon }).addTo(this.map).bindPopup('📍 Your Location');
  }

  private placeTowerMarkers(centerLat: number, centerLng: number) {
    const towers = [
      {
        id: 1,
        type: '5G NR',
        band: 'n78',
        sector: 'Alpha',
        lat: centerLat + 0.005,
        lng: centerLng + 0.008,
        maxSpeed: '1.2 Gbps',
        load: 65,
        ping: '12ms',
        status: 'Active'
      },
      {
        id: 2,
        type: 'LTE-A',
        band: 'Band 3',
        sector: 'Beta',
        lat: centerLat - 0.003,
        lng: centerLng + 0.012,
        maxSpeed: '150 Mbps',
        load: 45,
        ping: '28ms',
        status: 'Active'
      },
      {
        id: 3,
        type: '5G NR',
        band: 'n41',
        sector: 'Gamma',
        lat: centerLat + 0.008,
        lng: centerLng - 0.005,
        maxSpeed: '800 Mbps',
        load: 78,
        ping: '15ms',
        status: 'Active'
      },
      {
        id: 4,
        type: 'LTE',
        band: 'Band 40',
        sector: 'Delta',
        lat: centerLat - 0.007,
        lng: centerLng - 0.003,
        maxSpeed: '75 Mbps',
        load: 32,
        ping: '35ms',
        status: 'Active'
      },
      {
        id: 5,
        type: '5G NR',
        band: 'mmWave',
        sector: 'Epsilon',
        lat: centerLat + 0.012,
        lng: centerLng + 0.015,
        maxSpeed: '2.1 Gbps',
        load: 55,
        ping: '8ms',
        status: 'Active'
      }
    ];

    towers.forEach(tower => {
      const icon = L.divIcon({
        className: 'tower-marker',
        html: '<i class="fas fa-broadcast-tower" style="color: #ff6b35; font-size: 24px; filter: drop-shadow(0 0 8px #ff6b35);"></i>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker([tower.lat, tower.lng], { icon }).addTo(this.map);
      marker.bindPopup(`
        <div style="font-family: Inter, sans-serif; max-width: 200px;">
          <h4 style="margin: 0 0 8px 0; color: #333;">🗼 ${tower.type} Tower</h4>
          <div style="font-size: 12px; color: #666;">
            <div><strong>Sector:</strong> ${tower.sector}</div>
            <div><strong>Band:</strong> ${tower.band}</div>
            <div><strong>Max Speed:</strong> ${tower.maxSpeed}</div>
            <div><strong>Load:</strong> ${tower.load}%</div>
            <div><strong>Ping:</strong> ${tower.ping}</div>
            <div><strong>Status:</strong> <span style="color: #4ade80;">${tower.status}</span></div>
          </div>
        </div>
      `);

      this.towerMarkers.push(marker);
    });
  }

  private generateCoverageZones(centerLat: number, centerLng: number) {
    const zones = [
      // 5G Zones
      { type: '5G', lat: centerLat + 0.01, lng: centerLng + 0.01, label: 'City Center — 5G' },
      { type: '5G', lat: centerLat + 0.03, lng: centerLng + 0.04, label: 'Tech Park — 5G' },
      { type: '5G', lat: centerLat - 0.02, lng: centerLng + 0.05, label: 'Business Hub — 5G' },
      { type: '5G', lat: centerLat - 0.04, lng: centerLng + 0.08, label: 'Airport Zone — 5G' },
      // 4G Zones
      { type: '4G', lat: centerLat + 0.06, lng: centerLng - 0.04, label: 'Suburbs — 4G' },
      { type: '4G', lat: centerLat - 0.05, lng: centerLng - 0.03, label: 'Outskirts — 4G' },
      { type: '4G', lat: centerLat + 0.07, lng: centerLng + 0.07, label: 'Industrial Area — 4G' },
      { type: '4G', lat: centerLat + 0.09, lng: centerLng - 0.07, label: 'Rural Edge — 4G' }
    ];

    zones.forEach(zone => {
      const color = zone.type === '5G' ? '#107c10' : '#ff8c00';
      const fillColor = zone.type === '5G' ? '#107c10' : '#ff8c00';

      // Large outer heatmap circle
      const largeCircle = L.circle([zone.lat, zone.lng], {
        radius: 5000, // 5km radius
        color: color,
        weight: 1,
        opacity: 0.15,
        fillColor: fillColor,
        fillOpacity: 0.08
      }).addTo(this.map);

      // Medium circle
      const mediumCircle = L.circle([zone.lat, zone.lng], {
        radius: 3000, // 3km radius
        color: color,
        weight: 1,
        opacity: 0.2,
        fillColor: fillColor,
        fillOpacity: 0.12
      }).addTo(this.map);

      // Inner circle with label
      const innerCircle = L.circle([zone.lat, zone.lng], {
        radius: 1500, // 1.5km radius
        color: color,
        weight: 2,
        opacity: 0.5,
        fillColor: fillColor,
        fillOpacity: 0.25
      })
        .addTo(this.map)
        .bindPopup(
          `<b>${zone.label}</b><br><strong>${zone.type} Network</strong><br>Lat: ${zone.lat.toFixed(4)}<br>Lng: ${zone.lng.toFixed(4)}`
        );

      this.coverageCircles.push(largeCircle, mediumCircle, innerCircle);
    });
  }

  private updateEventMarkers() {
    const events = this.appState.events();
    if (events.length === this.eventMarkers.length) return; // No new events

    // Remove old markers
    this.eventMarkers.forEach(marker => {
      try {
        this.map.removeLayer(marker);
      } catch (e) {
        // Marker already removed
      }
    });
    this.eventMarkers = [];

    // Add new event markers (show last 25 events)
    const recentEvents = events.slice(-25);
    recentEvents.forEach(event => {
      const color = event.net === '5G' ? '#107c10' : '#ff8c00';
      const icon = L.divIcon({
        className: 'event-marker',
        html: `<i class="fas fa-location-dot" style="color: ${color}; font-size: 14px; filter: drop-shadow(0 0 3px rgba(0,0,0,0.5));"></i>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });

      const marker = L.marker([event.lat, event.lng], { icon })
        .addTo(this.map)
        .bindPopup(
          `<b>${event.net} Network</b><br><strong>${event.app}</strong><br>${event.data.toFixed(1)} MB<br>📍 ${event.lat.toFixed(4)}, ${event.lng.toFixed(4)}`
        );

      this.eventMarkers.push(marker);
    });
  }

  onTowerClick(tower: any) {
    console.log('Tower clicked:', tower);
  }

  getTowerClass(type: string): string {
    if (type.includes('5G')) return 'tower-5g';
    if (type.includes('LTE-A')) return 'tower-4g-pro';
    return 'tower-4g';
  }

  getLoadClass(load: number): string {
    if (load >= 80) return 'high-load';
    if (load >= 60) return 'medium-load';
    return 'low-load';
  }
}
