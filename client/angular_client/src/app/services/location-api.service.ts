import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';

export interface LocationData {
  id: number;
  lat: number;
  lng: number;
  signalType: '5G' | '4G';
  latency: number;
}

@Injectable({
  providedIn: 'root',
})
export class LocationApiService {
  private http = inject(HttpClient);
  private apiBaseUrl = 'http://localhost:5000/api';

  locations = signal<LocationData[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  fetchLocations() {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<LocationData[]>(`${this.apiBaseUrl}/locations`).subscribe({
      next: (data) => {
        this.locations.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch locations:', err);
        this.error.set(err.message || 'Failed to fetch locations');
        this.loading.set(false);
      },
    });
  }

  getLocations() {
    return this.locations();
  }
}
