import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MainLayoutComponent
  ],
  template: '<app-main-layout><router-outlet></router-outlet></app-main-layout>',
  styles: [`
    :host {
      display: block;
      height: 100vh;
      width: 100%;
    }
  `]
})
export class App {}

