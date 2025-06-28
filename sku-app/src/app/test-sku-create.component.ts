import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SkuService } from './services/drug-sku.service';
import { DrugSKU, SKUStatus } from './models/drug-sku.model';

@Component({
  selector: 'app-test-sku-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h2>Test SKU Creation</h2>
      <div class="form">
        <div>
          <label>NDC:</label>
          <input [(ngModel)]="testSku.ndc" />
        </div>
        <div>
          <label>Name:</label>
          <input [(ngModel)]="testSku.name" />
        </div>
        <div>
          <label>Manufacturer:</label>
          <input [(ngModel)]="testSku.manufacturer" />
        </div>
        <div>
          <label>Dosage Form:</label>
          <input [(ngModel)]="testSku.dosage_form" />
        </div>
        <div>
          <label>Strength:</label>
          <input [(ngModel)]="testSku.strength" />
        </div>
        <div>
          <label>Package Size:</label>
          <input [(ngModel)]="testSku.package_size" />
        </div>
        <div>
          <button (click)="createSku()">Create SKU</button>
        </div>
      </div>

      <div class="response-area" *ngIf="responseMessage">
        <h3>Response:</h3>
        <pre>{{responseMessage}}</pre>
      </div>

      <div class="error-area" *ngIf="errorMessage">
        <h3>Error:</h3>
        <pre>{{errorMessage}}</pre>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 20px; }
    .form { display: flex; flex-direction: column; gap: 10px; max-width: 400px; }
    .form div { display: flex; }
    .form label { width: 120px; }
    .form input { flex: 1; }
    .response-area { margin-top: 20px; padding: 10px; background: #eefff3; border: 1px solid #ccc; }
    .error-area { margin-top: 20px; padding: 10px; background: #fff0f0; border: 1px solid #f88; }
    pre { white-space: pre-wrap; }
  `]
})
export class TestSkuCreateComponent {
  testSku: DrugSKU = {
    ndc: 'test-' + Math.floor(Math.random() * 10000),
    name: 'Test SKU',
    manufacturer: 'Test Manufacturer',
    dosage_form: 'Tablet',
    strength: '10mg',
    package_size: '30 tablets',
    status: SKUStatus.DRAFT,
    created_at: new Date()
  };

  responseMessage: string = '';
  errorMessage: string = '';

  constructor(private skuService: SkuService) {}

  createSku() {
    this.responseMessage = '';
    this.errorMessage = '';
    
    console.log('Attempting to create SKU with:', this.testSku);
    
    this.skuService.createSKU(this.testSku).subscribe({
      next: (response) => {
        this.responseMessage = JSON.stringify(response, null, 2);
        console.log('SKU created successfully:', response);
        
        // Generate a new random NDC for the next test
        this.testSku = {
          ...this.testSku,
          ndc: 'test-' + Math.floor(Math.random() * 10000)
        };
      },
      error: (error) => {
        this.errorMessage = error.message || 'Unknown error occurred';
        console.error('Failed to create SKU:', error);
      }
    });
  }
}
