import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  sidenavOpened = false;
  sidenavMode: 'over' | 'side' = 'over';
  private breakpointObserver = inject(BreakpointObserver);
  private sub?: any;

  ngOnInit(): void {
    this.sub = this.breakpointObserver
      .observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .subscribe(state => {
        const isDesktop = state.matches;
        this.sidenavMode = isDesktop ? 'side' : 'over';
        this.sidenavOpened = isDesktop; // aberto por padrão no desktop
      });
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }
}
