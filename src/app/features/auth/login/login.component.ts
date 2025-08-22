import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
  <div class="login-container">
    <mat-card class="login-card">
      <div class="header">
        <mat-icon>lock</mat-icon>
        <h1>Entrar</h1>
        <p class="subtitle">Acesse para gerenciar suas tarefas</p>
      </div>

      <form (ngSubmit)="onSubmit()" class="form">
        <mat-form-field appearance="outline" class="full">
          <mat-label>Usuário</mat-label>
          <input matInput [(ngModel)]="username" name="username" required autocomplete="username" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Senha</mat-label>
          <input matInput [(ngModel)]="password" name="password" [type]="hide ? 'password' : 'text'" required autocomplete="current-password" />
          <button mat-icon-button matSuffix type="button" (click)="hide = !hide" [attr.aria-label]="hide ? 'Mostrar senha' : 'Ocultar senha'">
            <mat-icon>{{ hide ? 'visibility' : 'visibility_off' }}</mat-icon>
          </button>
        </mat-form-field>

        <div class="actions">
          <button mat-raised-button color="primary" type="submit" [disabled]="loading">
            <mat-icon *ngIf="!loading">login</mat-icon>
            <span *ngIf="!loading">Entrar</span>
            <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
          </button>
        </div>

        <p *ngIf="error" class="error">{{ error }}</p>
      </form>
    </mat-card>
  </div>
  `,
  styles: [`
    .login-container { display: grid; place-items: center; min-height: 100vh; padding: 16px; }
    .login-card { width: 100%; max-width: 400px; padding: 8px 8px 16px; }
    .header { text-align: center; padding: 16px 8px 8px; }
    .header mat-icon { color: var(--primary-color); }
    .header h1 { margin: 8px 0 0; font-size: 22px; font-weight: 600; }
    .header .subtitle { margin: 4px 0 0; color: rgba(0,0,0,.6); font-size: 13px; }
    form.form { display: grid; gap: 12px; padding: 8px; }
    .full { width: 100%; }
    .actions { display: flex; justify-content: center; padding-top: 4px; }
    .error { color: #c62828; margin: 4px 0 0; text-align: center; }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  username = '';
  password = '';
  hide = true;
  loading = false;
  error = '';

  onSubmit() {
    if (!this.username || !this.password) {
      this.snackBar.open('Informe usuário e senha', 'OK', { duration: 2500 });
      return;
    }

    this.loading = true;
    this.error = '';

    this.auth.login(this.username, this.password).subscribe({
      next: ({ accessToken }) => {
        this.auth.saveToken(accessToken);
        this.loading = false;
        this.snackBar.open('Login realizado com sucesso', 'OK', { duration: 2000 });
        this.router.navigateByUrl('/tasks');
      },
      error: (err) => {
        console.error('Falha no login:', err);
        this.error = err?.error?.message || 'Usuário ou senha inválidos';
        this.loading = false;
        this.snackBar.open(this.error, 'OK', { duration: 3500, panelClass: ['error-snackbar'] });
      }
    });
  }
}
