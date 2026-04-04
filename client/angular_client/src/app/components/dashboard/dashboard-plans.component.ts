import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-plans',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="section active">
      <div class="card">
        <div class="card-header">
          <span><i class="fas fa-lightbulb"></i> Smart Plan Recommender</span>
        </div>
        <div class="plan-intro">
          Based on your actual 5G availability and 4G usage, here are our recommendations:
        </div>
        <div class="plan-grid">
          <div class="plan-card featured">
            <div class="plan-badge">Recommended</div>
            <div class="plan-name">Turbo 5G Max</div>
            <div class="plan-price">₹599<span>/mo</span></div>
            <ul class="plan-features">
              <li><i class="fas fa-check"></i> Truly Unlimited 5G</li>
              <li><i class="fas fa-check"></i> 3GB/day 4G fallback</li>
              <li><i class="fas fa-check"></i> Priority network access</li>
              <li><i class="fas fa-check"></i> 100 SMS/day</li>
            </ul>
            <button class="btn-plan">Explore Plan</button>
          </div>
          <div class="plan-card">
            <div class="plan-name">Basic 5G</div>
            <div class="plan-price">₹299<span>/mo</span></div>
            <ul class="plan-features">
              <li><i class="fas fa-check"></i> Unlimited 5G</li>
              <li><i class="fas fa-check"></i> 1.5GB/day 4G</li>
              <li><i class="fas fa-times dim"></i> Priority access</li>
              <li><i class="fas fa-check"></i> 50 SMS/day</li>
            </ul>
            <button class="btn-plan outline">Explore Plan</button>
          </div>
          <div class="plan-card">
            <div class="plan-name">Value 4G</div>
            <div class="plan-price">₹199<span>/mo</span></div>
            <ul class="plan-features">
              <li><i class="fas fa-times dim"></i> No 5G</li>
              <li><i class="fas fa-check"></i> 2GB/day 4G</li>
              <li><i class="fas fa-times dim"></i> Priority access</li>
              <li><i class="fas fa-check"></i> 100 SMS/day</li>
            </ul>
            <button class="btn-plan outline">Explore Plan</button>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './dashboard-plans.css',
})
export class DashboardPlansComponent {}
