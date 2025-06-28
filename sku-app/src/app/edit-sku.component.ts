import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SkuService } from './services/drug-sku.service';
import { DrugSKU, SKUStatus } from './models/drug-sku.model';

@Component({
  selector: 'app-edit-sku',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatSelectModule,
    MatTableModule,
    MatProgressSpinnerModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Edit SKU</mat-card-title>
      </mat-card-header>
      
      <mat-card-content>
        <!-- Step 1: Find a SKU to edit -->
        <div class="search-section" *ngIf="!selectedSku">
          <h3>Find a SKU to Edit</h3>
          
          <div class="search-form">
            <mat-form-field>
              <mat-label>Search by Name</mat-label>
              <input matInput [(ngModel)]="searchQuery" placeholder="Enter drug name">
            </mat-form-field>
            
            <button mat-raised-button color="primary" (click)="searchSKU()" [disabled]="isLoading">
              <mat-icon>search</mat-icon>
              {{ isLoading ? 'Searching...' : 'Search' }}
            </button>
          </div>
          
          <!-- Loading Indicator -->
          <div class="loading-container" *ngIf="isLoading">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
          
          <!-- Results Table -->
          <table mat-table [dataSource]="searchResults" class="search-results-table" *ngIf="searchResults.length > 0">
            <!-- NDC Column -->
            <ng-container matColumnDef="ndc">
              <th mat-header-cell *matHeaderCellDef>NDC</th>
              <td mat-cell *matCellDef="let sku">{{sku.ndc}}</td>
            </ng-container>
            
            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let sku">{{sku.name}}</td>
            </ng-container>
            
            <!-- Manufacturer Column -->
            <ng-container matColumnDef="manufacturer">
              <th mat-header-cell *matHeaderCellDef>Manufacturer</th>
              <td mat-cell *matCellDef="let sku">{{sku.manufacturer}}</td>
            </ng-container>
            
            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let sku">
                <button mat-raised-button color="primary" (click)="selectSKUToEdit(sku)">
                  <mat-icon>edit</mat-icon> Edit
                </button>
              </td>
            </ng-container>
            
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          
          <!-- No Results Message -->
          <div class="no-results" *ngIf="searchPerformed && searchResults.length === 0">
            <p>No SKUs found matching your search criteria.</p>
          </div>
        </div>
        
        <!-- Step 2: Edit the selected SKU -->
        <div class="edit-form" *ngIf="selectedSku">
          <h3>Edit SKU: {{selectedSku.name}}</h3>
          
          <form #editForm="ngForm" (ngSubmit)="saveSKU()">
            <div class="form-grid">
              <!-- NDC (read-only) -->
              <mat-form-field appearance="outline">
                <mat-label>NDC</mat-label>
                <input matInput [(ngModel)]="editingSku.ndc" name="ndc" readonly>
              </mat-form-field>
              
              <!-- Name -->
              <mat-form-field appearance="outline">
                <mat-label>Drug Name</mat-label>
                <input matInput [(ngModel)]="editingSku.name" name="name" required>
              </mat-form-field>
              
              <!-- Manufacturer -->
              <mat-form-field appearance="outline">
                <mat-label>Manufacturer</mat-label>
                <input matInput [(ngModel)]="editingSku.manufacturer" name="manufacturer" required>
              </mat-form-field>
              
              <!-- Dosage Form -->
              <mat-form-field appearance="outline">
                <mat-label>Dosage Form</mat-label>
                <input matInput [(ngModel)]="editingSku.dosage_form" name="dosageForm" required>
              </mat-form-field>
              
              <!-- Strength -->
              <mat-form-field appearance="outline">
                <mat-label>Strength</mat-label>
                <input matInput [(ngModel)]="editingSku.strength" name="strength" required>
              </mat-form-field>
              
              <!-- Package Size -->
              <mat-form-field appearance="outline">
                <mat-label>Package Size</mat-label>
                <input matInput [(ngModel)]="editingSku.package_size" name="packageSize" required>
              </mat-form-field>
              
              <!-- GTIN -->
              <mat-form-field appearance="outline">
                <mat-label>GTIN (optional)</mat-label>
                <input matInput [(ngModel)]="editingSku.gtin" name="gtin">
              </mat-form-field>
              
              <!-- Status -->
              <mat-form-field appearance="outline">
                <mat-label>Status</mat-label>
                <mat-select [(ngModel)]="editingSku.status" name="status" required>
                  <mat-option [value]="SKUStatus.DRAFT">Draft</mat-option>
                  <mat-option [value]="SKUStatus.PENDING_REVIEW">Pending Review</mat-option>
                  <mat-option [value]="SKUStatus.APPROVED">Approved</mat-option>
                  <mat-option [value]="SKUStatus.REJECTED">Rejected</mat-option>
                  <mat-option [value]="SKUStatus.DELETED">Deleted</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            
            <!-- Form Actions -->
            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="!editForm.valid">
                <mat-icon>save</mat-icon> Save Changes
              </button>
              <button mat-button type="button" (click)="cancelEdit()">
                <mat-icon>cancel</mat-icon> Cancel
              </button>
            </div>
          </form>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    mat-card {
      margin: 2rem;
    }
    
    .search-section, .edit-form {
      margin-top: 1rem;
    }
    
    .search-form {
      display: flex;
      gap: 1rem;
      align-items: flex-end;
      margin-bottom: 1.5rem;
    }
    
    mat-form-field {
      flex: 1;
    }
    
    .search-results-table {
      width: 100%;
      margin-top: 1rem;
      margin-bottom: 2rem;
    }
    
    .loading-container {
      display: flex;
      justify-content: center;
      margin: 2rem 0;
    }
    
    .no-results {
      padding: 2rem;
      text-align: center;
      color: rgba(0, 0, 0, 0.54);
      background: #f5f5f5;
      border-radius: 4px;
    }
    
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }
    
    .form-actions {
      margin-top: 2rem;
      display: flex;
      gap: 1rem;
    }
  `]
})
export class EditSkuComponent implements OnInit {
  searchQuery = '';
  searchResults: DrugSKU[] = [];
  displayedColumns = ['ndc', 'name', 'manufacturer', 'actions'];
  searchPerformed = false;
  isLoading = false;
  SKUStatus = SKUStatus; // Make enum available in template
  
  selectedSku: DrugSKU | null = null;
  editingSku: DrugSKU = {
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
  
  ngOnInit(): void {
    // Optionally load all SKUs when the component initializes
    this.loadAllSKUs();
  }
  
  searchSKU(): void {
    if (!this.searchQuery.trim()) {
      this.loadAllSKUs();
      return;
    }
    
    this.isLoading = true;
    console.log('Edit component searching for:', this.searchQuery);
    
    const sanitizedQuery = this.searchQuery.trim();
    const encodedQuery = encodeURIComponent(sanitizedQuery);
    const apiUrl = `http://localhost:5000/api/skus?name=${encodedQuery}`;
    
    fetch(apiUrl)
      .then(response => {
        console.log('Edit component direct fetch response status:', response.status);
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Edit component direct fetch results:', data);
        
        if (data && Array.isArray(data.items)) {
          this.searchResults = data.items;
        } else {
          console.error('Response does not contain items array:', data);
          this.searchResults = [];
        }
        
        this.searchPerformed = true;
        this.isLoading = false;
      })
      .catch(error => {
        console.error('Error in edit component fetch API call:', error);
        this.snackBar.open(`Error searching for SKUs: ${error.message}`, 'Close', {duration: 3000});
        this.searchPerformed = true;
        this.searchResults = [];
        this.isLoading = false;
      });
  }
  
  loadAllSKUs(): void {
    this.isLoading = true;
    console.log('Edit component loading all SKUs');
    
    const apiUrl = 'http://localhost:5000/api/skus';
    
    fetch(apiUrl)
      .then(response => {
        console.log('Edit component all SKUs fetch response status:', response.status);
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Edit component all SKUs fetch results:', data);
        
        if (data && Array.isArray(data.items)) {
          this.searchResults = data.items;
        } else {
          console.error('Response does not contain items array:', data);
          this.searchResults = [];
        }
        
        this.searchPerformed = true;
        this.isLoading = false;
      })
      .catch(error => {
        console.error('Error in fetch API call for all SKUs:', error);
        this.snackBar.open(`Error loading SKUs: ${error.message}`, 'Close', {duration: 3000});
        this.searchPerformed = true;
        this.searchResults = [];
        this.isLoading = false;
      });
  }
  
  selectSKUToEdit(sku: DrugSKU): void {
    this.selectedSku = sku;
    this.editingSku = {...sku}; // Create a copy to avoid modifying the original
  }
  
  saveSKU(): void {
    if (!this.selectedSku || !this.selectedSku.id) {
      this.snackBar.open('Error: SKU ID not found', 'Close', {duration: 3000});
      return;
    }
    
    this.isLoading = true;
    this.skuService.partialUpdateSKU(this.selectedSku.id.toString(), this.editingSku).subscribe({
      next: (updatedSku) => {
        this.snackBar.open('SKU updated successfully', 'Close', {duration: 3000});
        this.isLoading = false;
        this.selectedSku = null; // Go back to search view
        
        // Update the search results if the SKU is there
        const index = this.searchResults.findIndex(s => s.id === updatedSku.id);
        if (index !== -1) {
          this.searchResults[index] = updatedSku;
        }
      },
      error: (error) => {
        console.error('Error updating SKU:', error);
        this.snackBar.open('Error updating SKU', 'Close', {duration: 3000});
        this.isLoading = false;
      }
    });
  }
  
  cancelEdit(): void {
    this.selectedSku = null;
    this.editingSku = {
      ndc: '',
      name: '',
      manufacturer: '',
      dosage_form: '',
      strength: '',
      package_size: '',
      status: SKUStatus.DRAFT
    };
  }
}
