import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { DrugSKU, SKUStatus } from './models/drug-sku.model';

@Component({
  selector: 'sku-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isNew ? 'Create SKU' : 'Edit SKU' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="skuForm" class="sku-form">
        <mat-form-field>
          <mat-label>NDC</mat-label>
          <input matInput formControlName="ndc" placeholder="xxxxx-xxxx-xx">
          <mat-error *ngIf="skuForm.get('ndc')?.hasError('pattern')">
            Invalid NDC format. Use xxxxx-xxxx-xx
          </mat-error>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Drug Name</mat-label>
          <input matInput formControlName="name" required>
          <mat-error *ngIf="skuForm.get('name')?.hasError('required')">
            Drug name is required
          </mat-error>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Manufacturer</mat-label>
          <input matInput formControlName="manufacturer" required>
          <mat-error *ngIf="skuForm.get('manufacturer')?.hasError('required')">
            Manufacturer is required
          </mat-error>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Dosage Form</mat-label>
          <input matInput formControlName="dosageForm" required>
          <mat-error *ngIf="skuForm.get('dosageForm')?.hasError('required')">
            Dosage form is required
          </mat-error>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Strength</mat-label>
          <input matInput formControlName="strength" required>
          <mat-error *ngIf="skuForm.get('strength')?.hasError('required')">
            Strength is required
          </mat-error>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Package Size</mat-label>
          <input matInput formControlName="packageSize" required>
          <mat-error *ngIf="skuForm.get('packageSize')?.hasError('required')">
            Package size is required
          </mat-error>
        </mat-form-field>

        <mat-form-field>
          <mat-label>GTIN</mat-label>
          <input matInput formControlName="gtin">
        </mat-form-field>

        <mat-form-field *ngIf="!isNew">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option *ngFor="let status of statuses" [value]="status">
              {{status}}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancel</button>
      <button mat-raised-button color="primary" 
              (click)="save()"
              [disabled]="skuForm.invalid">
        Save
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .sku-form {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      padding: 1rem 0;
      min-width: 600px;
    }

    mat-form-field {
      width: 100%;
    }
  `]
})
export class SkuEditDialogComponent {
  skuForm: FormGroup;
  isNew: boolean;
  statuses = Object.values(SKUStatus);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SkuEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { sku: DrugSKU }
  ) {
    this.isNew = !data.sku;
    this.skuForm = this.fb.group({
      ndc: [data.sku?.ndc || '', [Validators.pattern(/^\d{5}-\d{4}-\d{2}$/)]],
      name: [data.sku?.name || '', Validators.required],
      manufacturer: [data.sku?.manufacturer || '', Validators.required],
      dosageForm: [data.sku?.dosage_form || '', Validators.required],
      strength: [data.sku?.strength || '', Validators.required],
      packageSize: [data.sku?.package_size || '', Validators.required],
      gtin: [data.sku?.gtin || ''],
      status: [{ 
        value: data.sku?.status || SKUStatus.DRAFT,
        disabled: this.isNew
      }]
    });
  }

  save() {
    if (this.skuForm.valid) {
      const formValue = this.skuForm.getRawValue();
      this.dialogRef.close(formValue);
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
