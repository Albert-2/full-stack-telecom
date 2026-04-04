import { Injectable, inject } from '@angular/core';
import { AppStateService } from './app-state.service';

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  private appState = inject(AppStateService);
  private defaultLat = 20.5937; // India center
  private defaultLng = 78.9629;

  requestLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.appState.setUserLocation(lat, lng);
          console.log(`📍 Location acquired: ${lat}, ${lng}`);
        },
        (error) => {
          console.log('📍 Geolocation failed, using default coordinates:', error.message);
          this.useDefaultLocation();
        },
      );
    } else {
      console.log('📍 Geolocation not supported, using default coordinates');
      this.useDefaultLocation();
    }
  }

  private useDefaultLocation() {
    this.appState.setUserLocation(this.defaultLat, this.defaultLng);
  }
}
