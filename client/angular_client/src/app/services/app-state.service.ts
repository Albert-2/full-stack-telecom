import { Injectable, signal } from '@angular/core';

export interface User {
  email: string | null;
  isGuest: boolean;
  isAuthenticated: boolean;
  loginTime?: string;
}

export interface NetworkEvent {
  net: '5G' | '4G';
  app: string;
  data: number;
  lat: number;
  lng: number;
  time: string;
}

export interface Alert {
  msg: string;
  type: string;
  time: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  // State signals
  currentNetwork = signal<'5G' | '4G' | null>(null);
  used4g = signal<number>(0);
  used5g = signal<number>(0);
  events = signal<NetworkEvent[]>([]);
  alerts = signal<Alert[]>([]);
  alertCount = signal<number>(0);
  user = signal<User>({
    email: null,
    isGuest: false,
    isAuthenticated: false,
  });

  userLat = signal<number | null>(null);
  userLng = signal<number | null>(null);
  lastNetwork = signal<string | null>(null);
  warned75 = signal<boolean>(false);

  constructor() {
    if (typeof localStorage !== 'undefined') {
      this.loadUserFromStorage();
    }
  }

  private loadUserFromStorage() {
    const stored = localStorage.getItem('nexgen5g_user');
    if (stored) {
      this.user.set(JSON.parse(stored));
    }
  }

  setUser(user: User) {
    this.user.set(user);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('nexgen5g_user', JSON.stringify(user));
    }
  }

  clearUser() {
    this.user.set({
      email: null,
      isGuest: false,
      isAuthenticated: false,
    });
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('nexgen5g_user');
    }
  }

  addEvent(event: NetworkEvent) {
    this.events.update((e) => [...e, event]);
  }

  addAlert(alert: Alert) {
    this.alerts.update((a) => [alert, ...a]);
    this.alertCount.update((c) => c + 1);
  }

  clearAlerts() {
    this.alerts.set([]);
    this.alertCount.set(0);
  }

  setUserLocation(lat: number, lng: number) {
    this.userLat.set(lat);
    this.userLng.set(lng);
  }

  updateNetworkStats(net: '5G' | '4G', dataUsed: number) {
    if (net === '5G') {
      this.used5g.update((v) => v + dataUsed);
    } else {
      this.used4g.update((v) => v + dataUsed);
    }
  }

  getCurrentUser(): User | null {
    const user = this.user();
    return user.isAuthenticated ? user : null;
  }

  isUserAuthenticated(): boolean {
    return this.user().isAuthenticated;
  }
}
