import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { ChangeDetectionService, ChangeNotification, SkuFieldChange } from './services/change-detection.service';

@Component({
  selector: 'app-change-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatExpansionModule,
    MatSnackBarModule
  ],
  template: `
    <div class="notifications-container" *ngIf="pendingNotifications.length > 0">
      <mat-card class="notifications-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>notifications_active</mat-icon>
            Change Notifications
            <span class="notification-badge" 
                  matBadge="{{pendingNotifications.length}}" 
                  matBadgeColor="warn">
            </span>
          </mat-card-title>
          <mat-card-subtitle>
            Detected changes require your review
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <mat-accordion multi="true">
            <mat-expansion-panel 
              *ngFor="let notification of pendingNotifications; trackBy: trackByNotificationId"
              [expanded]="expandedNotifications.has(notification.id)">
              
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon [class]="getNotificationIcon(notification.type)">
                    {{getNotificationIconName(notification.type)}}
                  </mat-icon>
                  <span class="notification-title">
                    {{notification.message}}
                  </span>
                </mat-panel-title>
                <mat-panel-description>
                  <span class="notification-source">
                    {{getSourceLabel(notification.source)}}
                  </span>
                  <span class="notification-time">
                    {{notification.timestamp | date:'short'}}
                  </span>
                  <span *ngIf="notification.confidence" class="confidence-score">
                    {{notification.confidence * 100 | number:'1.0-0'}}% confidence
                  </span>
                </mat-panel-description>
              </mat-expansion-panel-header>

              <div class="notification-details">
                <div class="sku-info">
                  <h4>SKU Information:</h4>
                  <p><strong>NDC:</strong> {{notification.skuId}}</p>
                  <p><strong>Current Name:</strong> {{notification.oldData.name}}</p>
                </div>

                <div class="changes-list">
                  <h4>Detected Changes:</h4>
                  <div *ngFor="let change of notification.changes" class="change-item">
                    <div class="change-header">
                      <mat-icon class="change-icon">edit</mat-icon>
                      <strong>{{getFieldLabel(change.field)}}</strong>
                      <span class="change-type" [class]="'change-' + change.changeType">
                        {{change.changeType}}
                      </span>
                    </div>
                    <div class="change-values">
                      <div class="old-value" *ngIf="change.oldValue">
                        <span class="label">Current:</span>
                        <span class="value">{{change.oldValue}}</span>
                      </div>
                      <div class="new-value" *ngIf="change.newValue">
                        <span class="label">New:</span>
                        <span class="value new">{{change.newValue}}</span>
                      </div>
                      <div *ngIf="!change.oldValue && !change.newValue" class="no-value">
                        Field removed
                      </div>
                    </div>
                  </div>
                </div>

                <div class="notification-actions">
                  <button mat-raised-button color="primary" 
                          (click)="approveChanges(notification)">
                    <mat-icon>check</mat-icon>
                    Approve & Apply Changes
                  </button>
                  <button mat-button color="warn" 
                          (click)="rejectChanges(notification)">
                    <mat-icon>close</mat-icon>
                    Reject Changes
                  </button>
                  <button mat-button 
                          (click)="viewDetails(notification)">
                    <mat-icon>visibility</mat-icon>
                    View Full Details
                  </button>
                </div>
              </div>
            </mat-expansion-panel>
          </mat-accordion>
        </mat-card-content>
      </mat-card>
    </div>

    <div class="no-notifications" *ngIf="pendingNotifications.length === 0">
      <mat-icon>notifications_none</mat-icon>
      <p>No pending change notifications</p>
    </div>
  `,
  styles: [`
    .notifications-container {
      margin: 1rem 0;
    }

    .notifications-card {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
    }

    .notification-badge {
      margin-left: 0.5rem;
    }

    .notification-title {
      margin-left: 0.5rem;
      font-weight: 500;
    }

    .notification-source {
      background: #e3f2fd;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8em;
      margin-right: 0.5rem;
    }

    .notification-time {
      color: #666;
      font-size: 0.8em;
    }

    .confidence-score {
      background: #e8f5e8;
      color: #2e7d32;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8em;
      margin-left: 0.5rem;
    }

    .notification-details {
      padding: 1rem 0;
    }

    .sku-info {
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .sku-info h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .sku-info p {
      margin: 0.25rem 0;
    }

    .changes-list h4 {
      margin: 0 0 0.75rem 0;
      color: #333;
    }

    .change-item {
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-bottom: 0.75rem;
      padding: 0.75rem;
    }

    .change-header {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .change-icon {
      margin-right: 0.5rem;
      color: #666;
    }

    .change-type {
      margin-left: auto;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8em;
      font-weight: 500;
    }

    .change-added {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .change-modified {
      background: #fff3cd;
      color: #856404;
    }

    .change-removed {
      background: #f8d7da;
      color: #721c24;
    }

    .change-values {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .old-value, .new-value {
      display: flex;
      align-items: center;
    }

    .label {
      font-weight: 500;
      min-width: 60px;
      margin-right: 0.5rem;
      color: #666;
    }

    .value {
      padding: 0.25rem 0.5rem;
      background: #f5f5f5;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
    }

    .value.new {
      background: #e8f5e8;
      color: #2e7d32;
      font-weight: 500;
    }

    .no-value {
      color: #999;
      font-style: italic;
    }

    .notification-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #ddd;
    }

    .no-notifications {
      text-align: center;
      color: #666;
      padding: 2rem;
    }

    .no-notifications mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 1rem;
    }

    .dataset-icon { color: #1976d2; }
    .ocr-icon { color: #f57c00; }
    .context-icon { color: #388e3c; }

    @media (max-width: 768px) {
      .notification-actions {
        flex-direction: column;
      }
      
      .change-values {
        font-size: 0.9em;
      }
    }
  `]
})
export class ChangeNotificationsComponent implements OnInit, OnDestroy {
  pendingNotifications: ChangeNotification[] = [];
  expandedNotifications = new Set<string>();
  private subscription?: Subscription;

  constructor(
    private changeDetectionService: ChangeDetectionService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.subscription = this.changeDetectionService.changeNotifications$.subscribe(
      (notifications: ChangeNotification[]) => {
        this.pendingNotifications = notifications.filter((n: ChangeNotification) => n.actionRequired);
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  trackByNotificationId(index: number, notification: ChangeNotification): string {
    return notification.id;
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'dataset_change': return 'dataset-icon';
      case 'ocr_change': return 'ocr-icon';
      case 'context_change': return 'context-icon';
      default: return 'notification-icon';
    }
  }

  getNotificationIconName(type: string): string {
    switch (type) {
      case 'dataset_change': return 'storage';
      case 'ocr_change': return 'image_search';
      case 'context_change': return 'chat';
      default: return 'notifications';
    }
  }

  getSourceLabel(source: string): string {
    switch (source) {
      case 'dataset': return 'External Dataset';
      case 'ocr': return 'OCR Processing';
      case 'chat_context': return 'Chat Context';
      default: return source;
    }
  }

  getFieldLabel(field: string): string {
    const labels: { [key: string]: string } = {
      ndc: 'NDC',
      name: 'Product Name',
      manufacturer: 'Manufacturer',
      dosage_form: 'Dosage Form',
      strength: 'Strength',
      package_size: 'Package Size'
    };
    return labels[field] || field;
  }

  approveChanges(notification: ChangeNotification): void {
    this.changeDetectionService.handleNotification(notification.id, 'approved');
    this.snackBar.open(
      `Changes approved for SKU ${notification.skuId}`, 
      'Close', 
      { duration: 3000 }
    );
  }

  rejectChanges(notification: ChangeNotification): void {
    this.changeDetectionService.handleNotification(notification.id, 'rejected');
    this.snackBar.open(
      `Changes rejected for SKU ${notification.skuId}`, 
      'Close', 
      { duration: 3000 }
    );
  }

  viewDetails(notification: ChangeNotification): void {
    // Toggle expansion
    if (this.expandedNotifications.has(notification.id)) {
      this.expandedNotifications.delete(notification.id);
    } else {
      this.expandedNotifications.add(notification.id);
    }
  }
}
