import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';

import { Task, TaskStatus } from '../../../../core/models/task.model';
import { TaskService } from '../../../../core/services/task.service';
import { SharedModule } from '../../../../shared/shared.module';
import {ConfirmDialogComponent} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

// Form interface
export interface TaskFormData {
  title: FormControl<string | null>;
  description: FormControl<string | null>;
  status: FormControl<TaskStatus | null>;
}

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule
  ],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup<TaskFormData>;
  loading = false;
  isEditMode = false;
  taskStatuses = Object.values(TaskStatus);

  // Getter methods for form controls for better type safety
  get title() { return this.taskForm.get('title') as FormControl<string | null>; }
  get description() { return this.taskForm.get('description') as FormControl<string | null>; }
  get status() { return this.taskForm.get('status') as FormControl<TaskStatus | null>; }

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<TaskFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { task: Task | null; presetStatus?: TaskStatus }
  ) {
    this.taskForm = this.fb.group<TaskFormData>({
      title: this.fb.control('', [
        Validators.required,
        Validators.maxLength(100)
      ]),
      description: this.fb.control('', [
        Validators.required,
        Validators.maxLength(500)
      ]),
      status: this.fb.control<TaskStatus>(this.data?.presetStatus ?? TaskStatus.PENDING, [
        Validators.required
      ])
    });
  }

  ngOnInit(): void {
    if (this.data?.task) {
      this.isEditMode = true;
      this.taskForm.patchValue({
        title: this.data.task.title,
        description: this.data.task.description,
        status: this.data.task.status
      });

      // If we're in edit mode, mark all form controls as touched
      // to show validation errors immediately
      this.taskForm.markAllAsTouched();
    } else if (this.data?.presetStatus) {
      // Se for criação e veio preset de status, aplicamos
      this.status.setValue(this.data.presetStatus);
    }
  }

  /**
   * Gets the first invalid form control
   */
  private getFirstInvalidControl() {
    const controls = Object.entries(this.taskForm.controls);
    for (const [name, control] of controls) {
      if (control.invalid) {
        return { name, control };
      }
    }
    return null;
  }


  onSubmit(): void {
    // If form is invalid, show validation errors
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();

      // Show error for the first invalid field
      const invalidControl = this.getFirstInvalidControl();
      if (invalidControl) {
        invalidControl.control.markAsTouched();
        invalidControl.control.markAsDirty();

        // Scroll to the first invalid field
        const element = document.querySelector(`[formControlName="${invalidControl.name}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }

      this.snackBar.open('Preencha corretamente os campos obrigatórios', 'OK', {
        duration: 3000,
        panelClass: ['error-snackbar'],
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });

      return;
    }

    this.loading = true;
    const formValue = this.taskForm.getRawValue();

    // Create task data object with proper typing and trimmed values
    const taskData: Partial<Task> = {
      title: formValue.title?.trim() || '',
      description: formValue.description?.trim() || '',
      status: formValue.status || TaskStatus.PENDING
    };

    // Determine if we're creating or updating
    const operation = this.isEditMode && this.data.task
      ? this.taskService.updateTask(this.data.task.id as string, taskData)
      : this.taskService.createTask(taskData as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>);

    operation.pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (task) => {
        const message = this.isEditMode ? 'Tarefa atualizada com sucesso!' : 'Tarefa criada com sucesso!';
        this.snackBar.open(message, 'Fechar', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.dialogRef.close({ success: true, task });
      },
      error: (error) => {
        console.error('Erro ao salvar tarefa:', error);

        // More specific error messages based on the error
        let errorMessage = `Erro ao ${this.isEditMode ? 'atualizar' : 'criar'} tarefa. `;

        if (error.status === 0) {
          errorMessage += 'Não foi possível conectar ao servidor. Verifique sua conexão.';
        } else if (error.status === 400) {
          errorMessage += 'Dados inválidos. Verifique as informações preenchidas.';
        } else if (error.status === 401 || error.status === 403) {
          errorMessage = 'Você não tem autorização para realizar esta ação.';
        } else if (error.status >= 500) {
          errorMessage += 'Ocorreu um erro no servidor. Tente novamente mais tarde.';
        } else {
          errorMessage += 'Tente novamente.';
        }

        this.snackBar.open(errorMessage, 'OK', {
          duration: 5000,
          panelClass: ['error-snackbar'],
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      }
    });
  }

  /**
   * Handles the cancel action
   * Shows a confirmation dialog if there are unsaved changes
   */
  onCancel(): void {
    if (this.taskForm.dirty) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: 'Alterações não salvas',
          message: 'Você possui alterações não salvas. Tem certeza de que deseja descartá-las?',
          confirmText: 'Descartar',
          cancelText: 'Cancelar',
          confirmColor: 'warn'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.dialogRef.close({ success: false });
        }
      });
    } else {
      this.dialogRef.close({ success: false });
    }
  }
}
