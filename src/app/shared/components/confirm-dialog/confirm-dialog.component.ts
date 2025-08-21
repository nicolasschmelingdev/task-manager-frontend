import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'accent' | 'warn';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button 
        mat-button 
        [mat-dialog-close]="false"
        class="cancel-button"
      >
        {{ data.cancelText || 'Cancel' }}
      </button>
      
      <button 
        mat-raised-button 
        [color]="data.confirmColor || 'primary'"
        [mat-dialog-close]="true"
        class="confirm-button"
      >
        {{ data.confirmText || 'Confirm' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
      max-width: 500px;
      margin: 0 auto;
    }
    
    h2 {
      margin: 0 0 16px;
      font-size: 20px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
    }
    
    p {
      margin: 0;
      font-size: 16px;
      line-height: 1.5;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .mat-dialog-actions {
      margin-top: 24px;
      padding: 16px 0 0;
      justify-content: flex-end;
      
      button {
        margin-left: 8px;
        text-transform: uppercase;
        font-weight: 500;
        letter-spacing: 0.5px;
      }
      
      .cancel-button {
        color: rgba(0, 0, 0, 0.6);
      }
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }
}
