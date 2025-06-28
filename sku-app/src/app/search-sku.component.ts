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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { SkuService } from './services/drug-sku.service';
import { DrugSKU } from './models/drug-sku.model';

@Component({
  selector: 'sku-search',
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
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Search SKUs</mat-card-title>
      </mat-card-header>
      
      <mat-card-content>
        <!-- Search Form -->
        <div class="search-form">
          <mat-form-field>
            <mat-label>Drug Name</mat-label>
            <input matInput [(ngModel)]="searchCriteria.name" placeholder="Enter drug name">
          </mat-form-field>

          <div class="search-actions">
            <button mat-raised-button color="primary" (click)="debugSearch()" [disabled]="isSearching">
              <mat-icon>search</mat-icon>
              {{ isSearching ? 'Searching...' : 'Search' }}
            </button>
            <button mat-button (click)="clear()">
              <mat-icon>clear</mat-icon>
              Clear
            </button>
          </div>
        </div>

        <!-- Results Table -->
        <div class="results-section" *ngIf="skus.length > 0">
          <h3>Search Results ({{skus.length}} found)</h3>
          <table mat-table [dataSource]="skus" class="search-results-table">
            <!-- NDC Column -->
            <ng-container matColumnDef="ndc">
              <th mat-header-cell *matHeaderCellDef>NDC</th>
              <td mat-cell *matCellDef="let sku">{{sku.ndc}}</td>
            </ng-container>

            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Drug Name</th>
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
                <button mat-icon-button (click)="editSku(sku)" color="primary">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button (click)="viewSku(sku)">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button (click)="deleteSku(sku)" color="warn">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>

        <!-- No Results Message -->
        <div class="no-results" *ngIf="searchPerformed && skus.length === 0">
          <p>No SKUs found matching your search criteria.</p>
        </div>

        <!-- Edit Form -->
        <div class="edit-section" *ngIf="editingSku">
          <h3>Edit SKU: {{editingSku.name}}</h3>
          <form (ngSubmit)="saveEdit()" #editForm="ngForm">
            <div class="edit-form-grid">
              <mat-form-field appearance="outline">
                <mat-label>NDC</mat-label>
                <input matInput [(ngModel)]="editingSku.ndc" name="ndc" required readonly>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Drug Name</mat-label>
                <input matInput [(ngModel)]="editingSku.name" name="name" required>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Manufacturer</mat-label>
                <input matInput [(ngModel)]="editingSku.manufacturer" name="manufacturer" required>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Dosage Form</mat-label>
                <input matInput [(ngModel)]="editingSku.dosage_form" name="dosage_form" required>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Strength</mat-label>
                <input matInput [(ngModel)]="editingSku.strength" name="strength" required>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Package Size</mat-label>
                <input matInput [(ngModel)]="editingSku.package_size" name="package_size" required>
              </mat-form-field>
            </div>

            <div class="edit-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="!editForm.form.valid">
                <mat-icon>save</mat-icon>
                Save Changes
              </button>
              <button mat-button type="button" (click)="cancelEdit()">
                <mat-icon>cancel</mat-icon>
                Cancel
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

    .search-form {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 1rem;
      margin-bottom: 2rem;
      align-items: end;
    }

    .search-actions {
      display: flex;
      gap: 1rem;
    }

    .results-section {
      margin-top: 2rem;
    }

    .search-results-table {
      width: 100%;
    }

    .no-results {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    mat-form-field {
      width: 100%;
    }

    .edit-section {
      margin-top: 2rem;
      padding: 1.5rem;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #f9f9f9;
    }

    .edit-form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }

    .edit-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
    }
  `]
})
export class SearchSkuComponent implements OnInit {
  skus: DrugSKU[] = [];
  searchCriteria = { name: '' };
  searchPerformed = false;
  isSearching = false;
  displayedColumns: string[] = ['ndc', 'name', 'manufacturer', 'actions'];
  editingSku: DrugSKU | null = null;
  originalSku: DrugSKU | null = null;

  constructor(
    private skuService: SkuService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    console.log('Search component initialized');
    // Make sure to load all SKUs when the component initializes
    setTimeout(() => {
      console.log('Delayed initialization - Loading all SKUs');
      this.loadAllSkus();
    }, 100); // Small delay to ensure component is fully initialized
  }

  loadAllSkus() {
    console.log('Loading all SKUs');
    this.isSearching = true;
    
    const apiUrl = 'http://localhost:5000/api/skus';
    console.log(`API URL for loading all SKUs: ${apiUrl}`);
    
    // Use direct fetch API as it seems more reliable
    fetch(apiUrl)
      .then(response => {
        console.log('Direct fetch all SKUs response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Direct fetch all SKUs results:', data);
        
        if (data && Array.isArray(data.items)) {
          this.skus = data.items;
          console.log(`Loaded ${this.skus.length} SKUs successfully`);
          
          // Log the first few SKUs for debugging
          if (this.skus.length > 0) {
            console.log('First few SKUs:', this.skus.slice(0, 3));
          }
        } else {
          console.error('Response does not contain items array:', data);
          this.skus = [];
        }
        
        this.searchPerformed = true;
        this.isSearching = false;
        console.log('Updated skus array with all items:', this.skus.length, 'results');
      })
      .catch(err => {
        console.error('Error in fetch API call for all SKUs:', err);
        this.snackBar.open(`Error loading SKUs: ${err.message}`, 'Close', { duration: 3000 });
        this.searchPerformed = true;
        this.skus = [];
        this.isSearching = false;
      });
  }

  search() {
    console.log('Search called with criteria:', this.searchCriteria);
    
    if (!this.searchCriteria.name || this.searchCriteria.name.trim() === '') {
      console.log('No search criteria provided, loading all SKUs');
      this.loadAllSkus();
      return;
    }

    this.isSearching = true;
    console.log('Searching for drug name:', this.searchCriteria.name);
    
    const sanitizedName = this.searchCriteria.name.trim();
    console.log('Sanitized search term:', sanitizedName);
    
    // Use the direct fetch API approach as it seems more reliable
    const encodedName = encodeURIComponent(sanitizedName);
    const apiUrl = `http://localhost:5000/api/skus?name=${encodedName}`;
    
    fetch(apiUrl)
      .then(response => {
        console.log('Direct fetch response status:', response.status);
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Direct fetch results:', data);
        
        if (data && Array.isArray(data.items)) {
          this.skus = data.items;
        } else {
          console.error('Response does not contain items array:', data);
          this.skus = [];
        }
        
        this.searchPerformed = true;
        this.isSearching = false;
        console.log('Updated skus array with items:', this.skus.length, 'results');
      })
      .catch(err => {
        console.error('Error in fetch API call:', err);
        this.snackBar.open(`Error searching SKUs: ${err.message}`, 'Close', { duration: 3000 });
        this.searchPerformed = true;
        this.skus = [];
        this.isSearching = false;
      });
  }

  clear() {
    console.log('Clear button clicked, loading all SKUs');
    this.searchCriteria = { name: '' };
    this.loadAllSkus();
  }

  viewSku(sku: DrugSKU) {
    this.snackBar.open(`Viewing SKU: ${sku.name} (${sku.ndc})`, 'Close', { duration: 3000 });
  }

  deleteSku(sku: DrugSKU) {
    if (confirm(`Are you sure you want to delete SKU: ${sku.name}?`)) {
      if (sku.id) {
        this.skuService.deleteSKU(sku.id.toString()).subscribe({
          next: () => {
            this.snackBar.open('SKU deleted successfully', 'Close', { duration: 3000 });
            this.loadAllSkus();
          },
          error: (error: any) => {
            console.error('Error deleting SKU:', error);
            this.snackBar.open('Error deleting SKU', 'Close', { duration: 3000 });
          }
        });
      }
    }
  }

  editSku(sku: DrugSKU) {
    this.originalSku = { ...sku };
    this.editingSku = { ...sku };
  }

  saveEdit() {
    if (this.editingSku && this.editingSku.id) {
      this.skuService.partialUpdateSKU(this.editingSku.id.toString(), this.editingSku).subscribe({
        next: (updatedSku: DrugSKU) => {
          this.snackBar.open('SKU updated successfully', 'Close', { duration: 3000 });
          // Update the SKU in the local array
          const index = this.skus.findIndex(s => s.id === updatedSku.id);
          if (index !== -1) {
            this.skus[index] = updatedSku;
          }
          this.cancelEdit();
        },
        error: (error: any) => {
          console.error('Error updating SKU:', error);
          this.snackBar.open('Error updating SKU', 'Close', { duration: 3000 });
        }
      });
    }
  }

  cancelEdit() {
    this.editingSku = null;
    this.originalSku = null;
  }

  debugSearch() {
    console.log('Debug Search clicked with criteria:', this.searchCriteria);
    this.isSearching = true;
    
    // If no search criteria or empty string, load all SKUs
    if (!this.searchCriteria.name || this.searchCriteria.name.trim() === '') {
      console.log('No search criteria provided, loading all SKUs');
      this.loadAllSkus();
      return;
    }
    
    // Otherwise, perform search with the provided name
    const encodedName = encodeURIComponent(this.searchCriteria.name.trim());
    const apiUrl = `http://localhost:5000/api/skus?name=${encodedName}`;
    console.log('Making direct fetch call to:', apiUrl);
    
    fetch(apiUrl)
      .then(response => {
        console.log('Direct fetch response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Direct fetch results:', data);
        
        // Manually update UI with these results
        if (data && Array.isArray(data.items)) {
          this.skus = data.items;
          this.searchPerformed = true;
          console.log(`Search found ${this.skus.length} results`);
          
          // Log the first few SKUs for debugging
          if (this.skus.length > 0) {
            console.log('First few search results:', this.skus.slice(0, 3));
          }
        }
        this.isSearching = false;
      })
      .catch(err => {
        console.error('Direct fetch error:', err);
        this.snackBar.open(`Error searching SKUs: ${err.message}`, 'Close', { duration: 3000 });
        this.searchPerformed = true;
        this.skus = [];
        this.isSearching = false;
      });
  }
}
