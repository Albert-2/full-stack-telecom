import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-modal">
      <div class="auth-container">
        <div class="auth-header">
          <div class="auth-logo">
            <span class="logo-icon"><i class="fas fa-broadcast-tower"></i></span>
            <span class="logo-text">NexGen<span class="accent">5G</span></span>
          </div>
        </div>

        <form class="auth-form" (ngSubmit)="onSubmit()">
          <div class="auth-title">{{ isSignup() ? 'Sign Up' : 'Sign In' }}</div>
          <div class="auth-subtitle">Access your NexGen 5G dashboard</div>

          <!-- Email Input -->
          <div class="form-group">
            <label for="authEmail">Email Address</label>
            <input
              type="email"
              id="authEmail"
              class="auth-input"
              [(ngModel)]="email"
              name="email"
              placeholder="your@email.com"
              required
            />
            <span class="auth-error" *ngIf="emailError()">{{ emailError() }}</span>
          </div>

          <!-- Password Input -->
          <div class="form-group">
            <label for="authPassword">Password</label>
            <input
              type="password"
              id="authPassword"
              class="auth-input"
              [(ngModel)]="password"
              name="password"
              placeholder="7-14 characters"
              required
            />
            <span class="auth-hint">Must be 7-14 characters</span>
            <span class="auth-error" *ngIf="passwordError()">{{ passwordError() }}</span>
          </div>

          <!-- Error/Success Messages -->
          <div class="auth-error" *ngIf="authError()">{{ authError() }}</div>
          <div class="auth-success" *ngIf="authSuccess_signal()">{{ authSuccess_signal() }}</div>

          <!-- Submit Button -->
          <button type="submit" class="auth-btn">{{ isSignup() ? 'Sign Up' : 'Sign In' }}</button>

          <!-- Divider -->
          <div class="auth-divider"><span>or</span></div>

          <!-- Guest Button -->
          <button type="button" class="auth-btn auth-btn-secondary" (click)="onGuest()">
            Continue as Guest
          </button>

          <!-- Toggle Link -->
          <div class="auth-toggle">
            <span>{{ isSignup() ? 'Already have an account?' : "Don't have an account?" }}</span>
            <a href="#" (click)="toggleSignup($event)">{{ isSignup() ? 'Sign In' : 'Sign Up' }}</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styleUrl: './auth-modal.css',
})
export class AuthModalComponent {
  authSuccess = output<void>();
  guestMode = output<void>();

  email = '';
  password = '';
  isSignup = signal<boolean>(false);
  emailError = signal<string>('');
  passwordError = signal<string>('');
  authError = signal<string>('');
  authSuccess_signal = signal<string>('');

  get authSuccess_getter() {
    return this.authSuccess_signal;
  }

  constructor(private authService: AuthService) {}

  onSubmit() {
    this.emailError.set('');
    this.passwordError.set('');
    this.authError.set('');
    this.authSuccess_signal.set('');

    const result = this.authService.authenticateUser(this.email, this.password, this.isSignup());

    if (result.success) {
      this.authSuccess_signal.set(result.message);
      setTimeout(() => {
        this.email = '';
        this.password = '';
        this.authSuccess.emit();
      }, 1000);
    } else {
      this.authError.set(result.message);
    }
  }

  onGuest() {
    this.authService.guestMode();
    this.email = '';
    this.password = '';
    this.guestMode.emit();
  }

  toggleSignup(e: Event) {
    e.preventDefault();
    this.isSignup.update((v) => !v);
    this.emailError.set('');
    this.passwordError.set('');
    this.authError.set('');
    this.authSuccess_signal.set('');
  }
}
