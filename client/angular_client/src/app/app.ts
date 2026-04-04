import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { AuthModalComponent } from './components/auth/auth-modal.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AppStateService } from './services/app-state.service';
import { AuthService } from './services/auth.service';
import { GeolocationService } from './services/geolocation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    LandingPageComponent,
    AuthModalComponent,
    DashboardComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private appState = inject(AppStateService);
  private authService = inject(AuthService);
  private geolocation = inject(GeolocationService);

  showLanding = signal<boolean>(true);
  showAuthModal = signal<boolean>(false);
  showDashboard = computed(() => this.appState.user().isAuthenticated);

  ngOnInit() {
    // Request geolocation for map
    this.geolocation.requestLocation();

    const user = this.appState.getCurrentUser();
    if (user && user.isAuthenticated) {
      this.showLanding.set(false);
    }
  }

  onGuestAccess() {
    this.authService.guestMode();
    this.showLanding.set(false);
    this.showAuthModal.set(false);
  }

  onSignIn() {
    this.showLanding.set(false);
    this.showAuthModal.set(true);
  }

  onAuthSuccess() {
    this.showAuthModal.set(false);
  }
}
