import { Injectable } from '@angular/core';
import { AppStateService, User } from './app-state.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private storageKey = 'nexgen5g_users';

  constructor(private stateService: AppStateService) {}

  validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  validatePassword(password: string): boolean {
    return password.length >= 7 && password.length <= 14;
  }

  authenticateUser(
    email: string,
    password: string,
    isSignup: boolean,
  ): { success: boolean; message: string } {
    email = email.trim().toLowerCase();

    if (!this.validateEmail(email)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    if (!this.validatePassword(password)) {
      return { success: false, message: 'Password must be 7-14 characters long.' };
    }

    if (typeof localStorage === 'undefined') {
      return { success: false, message: 'Storage not available in this environment.' };
    }

    const users = JSON.parse(localStorage.getItem(this.storageKey) || '{}');

    if (isSignup) {
      if (users[email]) {
        return {
          success: false,
          message: 'This email is already registered. Please sign in instead.',
        };
      }
      users[email] = {
        email,
        password,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(this.storageKey, JSON.stringify(users));
      this.setCurrentUser(email, false);
      return { success: true, message: 'Account created successfully! Signing you in...' };
    } else {
      if (!users[email]) {
        return { success: false, message: 'Email not found. Please sign up first.' };
      }
      if (users[email].password !== password) {
        return { success: false, message: 'Incorrect password. Please try again.' };
      }
      this.setCurrentUser(email, false);
      return { success: true, message: 'Signed in successfully!' };
    }
  }

  setCurrentUser(email: string, isGuest: boolean = false) {
    const user: User = {
      email,
      isGuest,
      isAuthenticated: true,
      loginTime: new Date().toISOString(),
    };
    this.stateService.setUser(user);
  }

  guestMode() {
    const user: User = {
      email: 'guest@example.com',
      isGuest: true,
      isAuthenticated: true,
      loginTime: new Date().toISOString(),
    };
    this.stateService.setUser(user);
  }

  logout() {
    this.stateService.clearUser();
  }

  getCurrentUser(): User | null {
    return this.stateService.getCurrentUser();
  }
}
