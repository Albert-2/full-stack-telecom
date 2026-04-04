import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="landing-page">
      <div class="landing-container">
        <div class="landing-content">
          <div class="landing-logo">
            <span class="logo-icon"><i class="fas fa-broadcast-tower"></i></span>
            <span class="logo-text">NexGen<span class="accent">5G</span></span>
          </div>
          <h1 class="landing-title">5G Network Intelligence at Your Fingertips</h1>
          <p class="landing-subtitle">
            Monitor your network coverage, track data usage, and optimize your mobile experience
            with real-time transparency.
          </p>

          <div class="landing-features">
            <div class="feature">
              <div class="feature-icon"><i class="fas fa-signal"></i></div>
              <div class="feature-text">
                <h3>Live Network Monitoring</h3>
                <p>Real-time detection of 5G and 4G coverage transitions</p>
              </div>
            </div>
            <div class="feature">
              <div class="feature-icon"><i class="fas fa-map-marked-alt"></i></div>
              <div class="feature-text">
                <h3>Coverage Map</h3>
                <p>Global view of 5G zones and 4G fallback areas</p>
              </div>
            </div>
            <div class="feature">
              <div class="feature-icon"><i class="fas fa-chart-bar"></i></div>
              <div class="feature-text">
                <h3>Usage Analytics</h3>
                <p>Detailed tracking of your data consumption</p>
              </div>
            </div>
            <div class="feature">
              <div class="feature-icon"><i class="fas fa-bell"></i></div>
              <div class="feature-text">
                <h3>Smart Alerts</h3>
                <p>Instant notifications for network changes</p>
              </div>
            </div>
          </div>

          <div class="landing-cta">
            <button class="btn-main" (click)="onGuestAccess()">Get Started as Guest</button>
            <button class="btn-secondary" (click)="onSignIn()">Sign In</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './landing-page.css',
})
export class LandingPageComponent {
  guestAccess = output<void>();
  signIn = output<void>();

  onGuestAccess() {
    this.guestAccess.emit();
  }

  onSignIn() {
    this.signIn.emit();
  }
}
