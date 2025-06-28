import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SkuService } from './services/drug-sku.service';
import { DrugSKU } from './models/drug-sku.model';

@Component({
  selector: 'sku-delete',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Delete SKUs</mat-card-title>
        <mat-card-subtitle>Manage and delete existing SKUs</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <div class="search-section">
          <mat-form-field>
            <mat-label>Search SKUs to Delete</mat-label>
            <input matInput [(ngModel)]="searchTerm" (input)="filterSkus()" placeholder="Enter drug name or NDC">
          </mat-form-field>
        </div>

        <div class="skus-list" *ngIf="filteredSkus.length > 0">
          <h3>SKUs Available for Deletion ({{filteredSkus.length}} found)</h3>
          <table mat-table [dataSource]="filteredSkus" class="skus-table">
            <ng-container matColumnDef="ndc">
              <th mat-header-cell *matHeaderCellDef>NDC</th>
              <td mat-cell *matCellDef="let sku">{{sku.ndc}}</td>
            </ng-container>

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Drug Name</th>
              <td mat-cell *matCellDef="let sku">{{sku.name}}</td>
            </ng-container>

            <ng-container matColumnDef="manufacturer">
              <th mat-header-cell *matHeaderCellDef>Manufacturer</th>
              <td mat-cell *matCellDef="let sku">{{sku.manufacturer}}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let sku">{{sku.status}}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let sku">
                <button mat-raised-button color="warn" (click)="deleteSku(sku)">
                  <mat-icon>delete_forever</mat-icon>
                  Delete
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>

        <div class="no-results" *ngIf="skus.length === 0">
          <p>No SKUs available.</p>
        </div>

        <div class="no-filtered-results" *ngIf="skus.length > 0 && filteredSkus.length === 0">
          <p>No SKUs match your search criteria.</p>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    mat-card {
      margin: 2rem;
    }

    .search-section {
      margin-bottom: 2rem;
    }

    .skus-list {
      margin-top: 1rem;
    }

    .skus-table {
      width: 100%;
    }

    .no-results, .no-filtered-results {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    mat-form-field {
      width: 100%;
      max-width: 400px;
    }

    .mat-column-actions {
      width: 120px;
      text-align: center;
    }
  `]
})
export class DeleteSkuComponent implements OnInit {
  skus: DrugSKU[] = [];
  filteredSkus: DrugSKU[] = [];
  searchTerm = '';
  displayedColumns: string[] = ['ndc', 'name', 'manufacturer', 'actions'];

  constructor(
    private skuService: SkuService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadSkus();
  }

  loadSkus() {
    this.skuService.getAllSKUs().subscribe({
      next: (response: { items: DrugSKU[], total: number }) => {
        this.skus = response.items;
        this.filteredSkus = response.items;
      },
      error: (error: any) => {
        console.error('Error loading SKUs:', error);
        this.snackBar.open('Error loading SKUs', 'Close', { duration: 3000 });
      }
    });
  }

  filterSkus() {
    if (!this.searchTerm) {
      this.filteredSkus = this.skus;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredSkus = this.skus.filter(sku => 
      sku.name?.toLowerCase().includes(term) || 
      sku.ndc?.toLowerCase().includes(term) ||
      sku.manufacturer?.toLowerCase().includes(term)
    );
  }

  deleteSku(sku: DrugSKU) {
    const confirmMessage = `Are you sure you want to permanently delete this SKU?\n\nNDC: ${sku.ndc}\nName: ${sku.name}\nManufacturer: ${sku.manufacturer}\n\nThis action cannot be undone.`;
    
    if (confirm(confirmMessage)) {
      if (sku.id) {
        this.skuService.deleteSKU(sku.id.toString()).subscribe({
          next: () => {
            this.snackBar.open(`SKU "${sku.name}" deleted successfully`, 'Close', { duration: 3000 });
            this.loadSkus(); // Refresh the list
          },
          error: (error: any) => {
            console.error('Error deleting SKU:', error);
            this.snackBar.open('Error deleting SKU. Please try again.', 'Close', { duration: 3000 });
          }
        });
      }
    }
  }
}
