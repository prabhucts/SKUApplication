import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { SkuImageUploadComponent } from './sku-image-upload.component';
import { ChangeNotificationsComponent } from './change-notifications.component';
import { ChangeDetectionService } from './services/change-detection.service';
import { DrugSKU, SKUStatus } from './models/drug-sku.model';
import { ChatbotComponent } from './chatbot.component';

@Component({
  selector: 'app-sku-manager',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    SkuImageUploadComponent,
    ChangeNotificationsComponent,
    ChatbotComponent
  ],
  template: `
    <div class="sku-manager-container">
      <mat-card class="manager-header">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>inventory</mat-icon>
            SKU Management System
          </mat-card-title>
          <mat-card-subtitle class="feature-subtitle">
            OCR Processing & Change Detection
          </mat-card-subtitle>
        </mat-card-header>
      </mat-card>

      <!-- Change Notifications - Always visible if there are notifications -->
      <app-change-notifications></app-change-notifications>

      <mat-tab-group mat-stretch-tabs="false" mat-align-tabs="center">
        
        <!-- OCR Upload Tab -->
        <mat-tab label="OCR Upload">
          <div class="tab-content">
            <mat-card>
              <mat-card-header class="dark-header">
                <mat-card-title>Upload Product Image</mat-card-title>
                <mat-card-subtitle>
                  Extract SKU information automatically using OCR
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <sku-image-upload 
                  (extracted)="onOcrDataExtracted($event)"
                  (ocrCompleted)="onOcrCompleted($event)">
                </sku-image-upload>

                <div *ngIf="extractedData" class="extracted-data-display">
                  <h3>Extracted Data:</h3>
                  <div class="data-preview">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>NDC</mat-label>
                      <input matInput [(ngModel)]="extractedData.ndc" readonly>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Product Name</mat-label>
                      <input matInput [(ngModel)]="extractedData.name" readonly>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Manufacturer</mat-label>
                      <input matInput [(ngModel)]="extractedData.manufacturer" readonly>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Dosage Form</mat-label>
                      <input matInput [(ngModel)]="extractedData.dosage_form" readonly>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Strength</mat-label>
                      <input matInput [(ngModel)]="extractedData.strength" readonly>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Package Size</mat-label>
                      <input matInput [(ngModel)]="extractedData.package_size" readonly>
                    </mat-form-field>
                  </div>
                  
                  <div class="extracted-actions">
                    <button mat-raised-button color="primary" 
                            (click)="createSkuFromOcr()" 
                            [disabled]="!extractedData.ndc">
                      <mat-icon>add</mat-icon>
                      Create New SKU
                    </button>
                    <button mat-button (click)="clearExtractedData()">
                      <mat-icon>clear</mat-icon>
                      Clear Data
                    </button>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Dataset Testing Tab -->
        <mat-tab label="Dataset Testing">
          <div class="tab-content">
            <mat-card>
              <mat-card-header class="dark-header">
                <mat-card-title>Test Dataset Changes</mat-card-title>
                <mat-card-subtitle>
                  Simulate external dataset changes for testing
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="dataset-testing">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Dataset JSON</mat-label>
                    <textarea matInput 
                              [(ngModel)]="testDatasetJson" 
                              rows="10"
                              placeholder="Paste SKU dataset JSON here...">
                    </textarea>
                  </mat-form-field>
                  
                  <div class="dataset-actions">
                    <button mat-raised-button color="accent" 
                            (click)="processDatasetChanges()"
                            [disabled]="!testDatasetJson">
                      <mat-icon>sync</mat-icon>
                      Process Dataset Changes
                    </button>
                    <button mat-button (click)="loadSampleDataset()">
                      <mat-icon>insert_drive_file</mat-icon>
                      Load Sample Dataset
                    </button>
                    <button mat-button (click)="clearDataset()">
                      <mat-icon>clear</mat-icon>
                      Clear
                    </button>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Conversational Chatbot Tab -->
        <mat-tab label="SKU Chatbot">
          <div class="tab-content">
            <mat-card>
              <mat-card-header class="dark-header">
                <mat-card-title>SKU Conversational Interface</mat-card-title>
                <mat-card-subtitle>
                  Use natural language to add, edit, search, or delete SKUs
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="chatbot-info">
                  <p>Try commands like:</p>
                  <ul>
                    <li>"Add a new SKU for Aspirin 81mg by Bayer"</li>
                    <li>"Search for all SKUs with Ibuprofen"</li>
                    <li>"Edit SKU 12345-678-90"</li>
                    <li>"Delete SKU 98765-432-10"</li>
                  </ul>
                </div>
                <div class="chatbot-container" style="height: 550px;">
                  <sku-chatbot></sku-chatbot>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Chat Context Tab -->
        <mat-tab label="Chat Context">
          <div class="tab-content">
            <mat-card>
              <mat-card-header class="dark-header">
                <mat-card-title>Chat Context Management</mat-card-title>
                <mat-card-subtitle>
                  View and manage chat session context
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="chat-context-info" *ngIf="chatStats">
                  <div class="stats-grid">
                    <div class="stat-item">
                      <mat-icon>chat</mat-icon>
                      <div class="stat-content">
                        <div class="stat-number">{{chatStats.messageCount}}</div>
                        <div class="stat-label">Messages</div>
                      </div>
                    </div>
                    
                    <div class="stat-item">
                      <mat-icon>tag</mat-icon>
                      <div class="stat-content">
                        <div class="stat-number">{{chatStats.mentionedSkusCount}}</div>
                        <div class="stat-label">Mentioned SKUs</div>
                      </div>
                    </div>
                    
                    <div class="stat-item">
                      <mat-icon>add_circle</mat-icon>
                      <div class="stat-content">
                        <div class="stat-number">{{chatStats.createdSkusCount}}</div>
                        <div class="stat-label">Created SKUs</div>
                      </div>
                    </div>
                    
                    <div class="stat-item">
                      <mat-icon>edit</mat-icon>
                      <div class="stat-content">
                        <div class="stat-number">{{chatStats.modifiedSkusCount}}</div>
                        <div class="stat-label">Modified SKUs</div>
                      </div>
                    </div>
                    
                    <div class="stat-item">
                      <mat-icon>notifications</mat-icon>
                      <div class="stat-content">
                        <div class="stat-number">{{chatStats.pendingNotifications}}</div>
                        <div class="stat-label">Pending Notifications</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="context-actions">
                    <button mat-raised-button color="warn" 
                            (click)="resetChatContext()">
                      <mat-icon>refresh</mat-icon>
                      Reset Chat Context
                    </button>
                    <button mat-button (click)="addTestMessage()">
                      <mat-icon>add_comment</mat-icon>
                      Add Test Message
                    </button>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .sku-manager-container {
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .manager-header {
      margin-bottom: 1rem;
    }

    .tab-content {
      padding: 1rem 0;
    }

    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }

    .extracted-data-display {
      margin-top: 2rem;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #fafafa;
    }

    .data-preview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }

    .extracted-actions, .dataset-actions, .context-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }

    .dataset-testing textarea {
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 8px;
      gap: 1rem;
    }

    .stat-item mat-icon {
      color: #1976d2;
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .stat-content {
      flex: 1;
    }

    .stat-number {
      font-size: 1.5rem;
      font-weight: bold;
      color: #333;
    }

    .stat-label {
      color: #666;
      font-size: 0.9rem;
    }

    .chat-context-info {
      min-height: 200px;
    }

    @media (max-width: 768px) {
      .extracted-actions, .dataset-actions, .context-actions {
        flex-direction: column;
      }
      
      .data-preview {
        grid-template-columns: 1fr;
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SkuManagerComponent implements OnInit {
  extractedData: Partial<DrugSKU> | null = null;
  testDatasetJson: string = '';
  chatStats: any = null;

  constructor(
    private changeDetectionService: ChangeDetectionService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.updateChatStats();
    
    // Subscribe to chat context changes
    this.changeDetectionService.chatContext$.subscribe(() => {
      this.updateChatStats();
    });
  }

  onOcrDataExtracted(data: Partial<DrugSKU>): void {
    this.extractedData = data;
    
    // Track this as a chat message
    this.changeDetectionService.addChatMessage({
      user: true,
      text: `Uploaded image for SKU processing. NDC: ${data.ndc || 'not detected'}`,
      extractedData: data
    });
  }

  onOcrCompleted(result: any): void {
    // Check for changes against existing SKUs
    if (result.success && result.sku_data.ndc) {
      this.changeDetectionService.detectOcrChanges(result.sku_data, result.confidence);
    }
  }

  createSkuFromOcr(): void {
    if (!this.extractedData || !this.extractedData.ndc) {
      this.snackBar.open('No valid NDC found in extracted data', 'Close', { duration: 3000 });
      return;
    }

    // This would typically create the SKU through the service
    const newSku: DrugSKU = {
      id: Date.now(),
      ndc: this.extractedData.ndc,
      name: this.extractedData.name || '',
      manufacturer: this.extractedData.manufacturer || '',
      dosage_form: this.extractedData.dosage_form || '',
      strength: this.extractedData.strength || '',
      package_size: this.extractedData.package_size || '',
      status: SKUStatus.APPROVED
    };

    // Track SKU creation
    this.changeDetectionService.trackSkuCreation(newSku);
    
    // Add chat message
    this.changeDetectionService.addChatMessage({
      user: false,
      text: `Created new SKU from OCR data: ${newSku.ndc} - ${newSku.name}`
    });

    this.snackBar.open(`SKU ${newSku.ndc} created from OCR data`, 'Close', { duration: 3000 });
    this.clearExtractedData();
  }

  clearExtractedData(): void {
    this.extractedData = null;
  }

  processDatasetChanges(): void {
    try {
      const dataset: DrugSKU[] = JSON.parse(this.testDatasetJson);
      
      if (!Array.isArray(dataset)) {
        throw new Error('Dataset must be an array of SKU objects');
      }

      this.changeDetectionService.detectDatasetChanges(dataset);
      
      // Add chat message
      this.changeDetectionService.addChatMessage({
        user: true,
        text: `Processed dataset with ${dataset.length} SKUs for change detection`
      });

      this.snackBar.open(
        `Processed ${dataset.length} SKUs from dataset`, 
        'Close', 
        { duration: 3000 }
      );
    } catch (error) {
      this.snackBar.open('Invalid JSON format', 'Close', { duration: 3000 });
    }
  }

  loadSampleDataset(): void {
    // Sample dataset with modified SKU data
    const sampleDataset = [
      {
        "id": 1,
        "ndc": "12345-123-12",
        "name": "UPDATED Aspirin Tablets",
        "manufacturer": "UPDATED Pharma Inc",
        "dosage_form": "tablet",
        "strength": "325mg",
        "package_size": "100 tablets",
        "status": "active"
      },
      {
        "id": 2,
        "ndc": "67890-678-90",
        "name": "Ibuprofen Capsules MODIFIED",
        "manufacturer": "Generic Corp",
        "dosage_form": "capsule",
        "strength": "400mg",
        "package_size": "50 capsules",
        "status": "active"
      }
    ];

    this.testDatasetJson = JSON.stringify(sampleDataset, null, 2);
  }

  clearDataset(): void {
    this.testDatasetJson = '';
  }

  updateChatStats(): void {
    this.chatStats = this.changeDetectionService.getChatStats();
  }

  resetChatContext(): void {
    this.changeDetectionService.resetChatContext();
    this.snackBar.open('Chat context reset', 'Close', { duration: 2000 });
    this.updateChatStats();
  }

  addTestMessage(): void {
    this.changeDetectionService.addChatMessage({
      user: true,
      text: `Test message with NDC reference: 12345-123-12 and another: 67890-678-90`
    });
    
    this.snackBar.open('Test message added', 'Close', { duration: 2000 });
  }
}
