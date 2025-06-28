import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { SkuService } from './services/drug-sku.service';
import { DrugSKU } from './models/drug-sku.model';

@Component({
  selector: 'sku-image-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule
  ],
  template: `
    <div class="upload-container" 
         [class.drag-active]="isDragging"
         (dragover)="onDragOver($event)"
         (dragleave)="onDragLeave($event)"
         (drop)="onDrop($event)">
      
      <input type="file" 
             #fileInput
             hidden
             accept="image/*"
             (change)="onFileSelected($event)">
      
      <div class="upload-content" *ngIf="!isLoading">
        <mat-icon class="upload-icon">cloud_upload</mat-icon>
        <h3>Upload Product Image</h3>
        <p>Drag and drop a product image here or click to browse</p>
        <button mat-raised-button color="primary" (click)="fileInput.click()">
          <mat-icon>photo_camera</mat-icon>
          Choose Image
        </button>
      </div>

      <div *ngIf="isLoading" class="loading-overlay">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Processing image with OCR...</p>
        <p class="loading-detail">Extracting product information...</p>
      </div>

      <div *ngIf="ocrResult && !isLoading" class="ocr-result">
        <mat-card>
          <mat-card-header>
            <mat-card-title>
              <mat-icon>visibility</mat-icon>
              OCR Results
            </mat-card-title>
            <mat-card-subtitle>Confidence: {{ocrResult.confidence * 100 | number:'1.0-0'}}%</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="extracted-data">
              <h4>Extracted Information:</h4>
              <div class="data-field" *ngFor="let field of getExtractedFields()">
                <strong>{{field.label}}:</strong> {{field.value || 'Not detected'}}
              </div>
            </div>
            <div class="actions">
              <button mat-raised-button color="primary" (click)="confirmExtraction()">
                <mat-icon>check</mat-icon>
                Use This Data
              </button>
              <button mat-button (click)="clearResults()">
                <mat-icon>refresh</mat-icon>
                Try Again
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .upload-container {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      position: relative;
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fafafa;
      transition: all 0.3s ease;
    }

    .drag-active {
      border-color: #1976d2;
      background: #e3f2fd;
    }

    .upload-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #666;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }

    .upload-icon {
      font-size: 64px !important;
      width: 64px !important;
      height: 64px !important;
      margin-bottom: 1rem;
    }

    .loading-detail {
      font-size: 0.9em;
      color: #666;
      margin-top: 0.5rem;
    }

    .ocr-result {
      width: 100%;
      margin-top: 1rem;
    }

    .extracted-data {
      margin-bottom: 1rem;
    }

    .data-field {
      padding: 0.5rem 0;
      border-bottom: 1px solid #eee;
    }

    .data-field:last-child {
      border-bottom: none;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 1rem;
    }

    mat-card {
      text-align: left;
    }

    mat-card-header {
      margin-bottom: 1rem;
    }
  `]
})
export class SkuImageUploadComponent {
  @Output() extracted = new EventEmitter<Partial<DrugSKU>>();
  @Output() ocrCompleted = new EventEmitter<any>();
  
  isDragging = false;
  isLoading = false;
  ocrResult: any = null;

  constructor(
    private skuService: SkuService,
    private snackBar: MatSnackBar
  ) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.processFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const element = event.target as HTMLInputElement;
    const files = element.files;
    if (files?.length) {
      this.processFile(files[0]);
    }
  }

  private async processFile(file: File) {
    if (!file.type.startsWith('image/')) {
      this.snackBar.open('Please upload an image file', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    this.ocrResult = null;

    try {
      const formData = new FormData();
      formData.append('file', file);

      this.skuService.extractFromImage(formData).subscribe({
        next: (result) => {
          this.ocrResult = result;
          this.isLoading = false;
          
          if (result.success) {
            this.snackBar.open(
              `OCR completed with ${(result.confidence * 100).toFixed(0)}% confidence`, 
              'Close', 
              { duration: 3000 }
            );
            this.ocrCompleted.emit(result);
          } else {
            this.snackBar.open('OCR processing failed', 'Close', { duration: 3000 });
          }
        },
        error: (error) => {
          console.error('OCR Error:', error);
          this.isLoading = false;
          this.snackBar.open('Failed to process image', 'Close', { duration: 3000 });
        }
      });
    } catch (error) {
      console.error('Error processing image:', error);
      this.isLoading = false;
      this.snackBar.open('Error processing image', 'Close', { duration: 3000 });
    }
  }

  getExtractedFields() {
    if (!this.ocrResult?.sku_data) return [];
    
    const data = this.ocrResult.sku_data;
    return [
      { label: 'NDC', value: data.ndc },
      { label: 'Product Name', value: data.name },
      { label: 'Manufacturer', value: data.manufacturer },
      { label: 'Dosage Form', value: data.dosage_form },
      { label: 'Strength', value: data.strength },
      { label: 'Package Size', value: data.package_size }
    ];
  }

  confirmExtraction() {
    if (this.ocrResult?.sku_data) {
      this.extracted.emit(this.ocrResult.sku_data);
      this.clearResults();
    }
  }

  clearResults() {
    this.ocrResult = null;
    this.isLoading = false;
  }
}
