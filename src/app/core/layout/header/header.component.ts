import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button (click)="onToggleSidenav()" aria-label="Toggle sidenav">
        <mat-icon>menu</mat-icon>
      </button>
      <span class="app-title">Task Manager</span>
      <span class="spacer"></span>
      <button mat-icon-button aria-label="Notifications">
        <mat-icon>notifications</mat-icon>
      </button>
      <button mat-icon-button aria-label="Account">
        <mat-icon>account_circle</mat-icon>
      </button>
    </mat-toolbar>
  `,
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Output() toggleSidenav = new EventEmitter<void>();

  onToggleSidenav(): void {
    this.toggleSidenav.emit();
  }
}
