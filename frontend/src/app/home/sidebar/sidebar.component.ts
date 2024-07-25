import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { LogoutService } from './services/logout.service';
import { NetworkErrorHandlerService } from '../../shared/services/network-error-handler.service';
import {
  TuiAlertService,
  TuiScrollbarModule,
  TuiSvgModule,
} from '@taiga-ui/core';
import { CommonModule } from '@angular/common';
import { TuiSidebarModule } from '@taiga-ui/addon-mobile';
import { TuiActiveZoneModule } from '@taiga-ui/cdk';
import { TuiAvatarModule } from '@taiga-ui/kit';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TuiSidebarModule,
    TuiActiveZoneModule,
    TuiScrollbarModule,
    TuiAvatarModule,
    TuiSvgModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  logoutService = inject(LogoutService);
  authService = inject(AuthService);
  router = inject(Router);
  networkErrorHandler = inject(NetworkErrorHandlerService);
  alerts = inject(TuiAlertService);
  isLoading = false;

  logout() {
    this.isLoading = true;

    this.logoutService.logout().subscribe({
      next: () => {
        this.isLoading = false;
        this.authService.setLogoutState();
        this.router.navigateByUrl('/auth/login');

        const byeMsgs = [
          'See you soon',
          'We will miss you',
          'Bye Bye',
          'Have a great day',
        ];
        this.alerts
          .open(byeMsgs[Math.floor(Math.random() * byeMsgs.length)], {
            autoClose: 1500,
            status: 'success',
          })
          .subscribe();
      },
      error: (err) => {
        this.networkErrorHandler.handleError(err);
        this.isLoading = false;
      },
    });
  }

  open: boolean = false;

  toggle(open: boolean): void {
    this.open = open;
  }

  close() {
    this.open = false;
  }
}
