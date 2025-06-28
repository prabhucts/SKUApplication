import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DrugSKU, SKUStatus } from './models/drug-sku.model';

@Component({
  selector: 'sku-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form (ngSubmit)="onSubmit()" #skuForm="ngForm" class="sku-form">
      <label>NDC <input [(ngModel)]="sku.ndc" name="ndc" required /></label>
      <label>Drug Name <input [(ngModel)]="sku.name" name="name" required /></label>
      <label>Manufacturer <input [(ngModel)]="sku.manufacturer" name="manufacturer" required /></label>
      <label>Dosage Form <input [(ngModel)]="sku.dosage_form" name="dosage_form" required /></label>
      <label>Strength <input [(ngModel)]="sku.strength" name="strength" required /></label>
      <label>Package Size <input [(ngModel)]="sku.package_size" name="package_size" required /></label>
      <label>Status <input [(ngModel)]="sku.status" name="status" required /></label>
      <button type="submit">{{ submitLabel }}</button>
      <button type="button" (click)="cancel.emit()">Cancel</button>
    </form>
  `,
  styles: [`
    .sku-form { display: flex; flex-direction: column; gap: 0.5rem; max-width: 400px; }
    .sku-form label { display: flex; flex-direction: column; font-weight: 500; }
    .sku-form input { padding: 0.4rem; border-radius: 0.3rem; border: 1px solid #e5e7eb; }
    .sku-form button { margin-top: 1rem; }
  `]
})
export class SkuFormComponent {
  @Input() sku: DrugSKU = {
    ndc: '', 
    name: '', 
    manufacturer: '', 
    dosage_form: '', 
    strength: '', 
    package_size: '', 
    status: SKUStatus.APPROVED,
    created_at: new Date()
  };
  @Input() submitLabel = 'Save';
  @Output() save = new EventEmitter<DrugSKU>();
  @Output() cancel = new EventEmitter<void>();

  onSubmit() {
    this.save.emit(this.sku);
  }
}
