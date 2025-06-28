import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SkuService } from './services/drug-sku.service';
import { DrugSKU, SKUStatus } from './models/drug-sku.model';

@Component({
  selector: 'sku-new',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Create New SKU</mat-card-title>
        <mat-card-subtitle>Enter the details for a new drug SKU</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <form (ngSubmit)="onSubmit()" #skuForm="ngForm">
          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>NDC (National Drug Code)</mat-label>
              <input matInput [(ngModel)]="newSku.ndc" name="ndc" required>
              <mat-hint>Format: XXXXX-XXXX-XX</mat-hint>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Drug Name</mat-label>
              <input matInput [(ngModel)]="newSku.name" name="name" required>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Manufacturer</mat-label>
              <input matInput [(ngModel)]="newSku.manufacturer" name="manufacturer" required>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Dosage Form</mat-label>
              <input matInput [(ngModel)]="newSku.dosage_form" name="dosage_form" required placeholder="e.g., Tablet, Capsule">
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Strength</mat-label>
              <input matInput [(ngModel)]="newSku.strength" name="strength" required placeholder="e.g., 100mg">
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Package Size</mat-label>
              <input matInput [(ngModel)]="newSku.package_size" name="package_size" required placeholder="e.g., 30 tablets">
            </mat-form-field>
          </div>

          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="!skuForm.form.valid">
              Create SKU
            </button>
            <button mat-button type="button" (click)="onReset()">
              Reset Form
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    mat-card {
      margin: 2rem;
      max-width: 800px;
    }

    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      width: 48%;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
    }

    mat-form-field {
      width: 100%;
    }
  `]
})
export class NewSkuComponent {
  newSku: DrugSKU = {
    ndc: '',
    name: '',
    manufacturer: '',
    dosage_form: '',
    strength: '',
    package_size: '',
    status: SKUStatus.DRAFT
  };

  constructor(
    private skuService: SkuService,
    private snackBar: MatSnackBar
  ) {}

  onSubmit() {
    if (this.isValidSku()) {
      this.skuService.createSKU(this.newSku).subscribe({
        next: (response) => {
          this.snackBar.open('SKU created successfully!', 'Close', {
            duration: 3000
          });
          this.onReset();
        },
        error: (error) => {
          console.error('Error creating SKU:', error);
          this.snackBar.open('Error creating SKU. Please try again.', 'Close', {
            duration: 3000
          });
        }
      });
    }
  }

  onReset() {
    this.newSku = {
      ndc: '',
      name: '',
      manufacturer: '',
      dosage_form: '',
      strength: '',
      package_size: '',
      status: SKUStatus.DRAFT
    };
  }

  private isValidSku(): boolean {
    return !!(this.newSku.ndc && this.newSku.name && this.newSku.manufacturer && 
              this.newSku.dosage_form && this.newSku.strength && this.newSku.package_size);
  }
}
