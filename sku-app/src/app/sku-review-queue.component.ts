import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrugSKU } from './models/drug-sku.model';

export interface ReviewEvent {
  type: 'create' | 'update' | 'delete';
  sku: DrugSKU;
  diff?: Partial<DrugSKU>;
  aiConfidence?: number;
}

type SkuKey = keyof DrugSKU;

@Component({
  selector: 'sku-review-queue',
  template: `
    <div *ngIf="reviewEvents.length > 0" class="review-queue">
      <h3>Review & Approve Changes</h3>
      <div *ngFor="let event of reviewEvents; let i = index" class="review-event">
        <div><strong>Type:</strong> {{ event.type | titlecase }}</div>
        <div>            <strong>SKU:</strong> {{ event.sku.ndc }} - {{ event.sku.name }}</div>
        <div *ngIf="event.diff"><strong>Changes:</strong>
          <ul>
            <li *ngFor="let key of diffKeys(event.diff)">
              {{ key }}: <span class="old">{{ getSkuValue(event.sku, key) }}</span> → <span class="new">{{ getDiffValue(event.diff, key) }}</span>
            </li>
          </ul>
        </div>
        <div *ngIf="event.aiConfidence !== undefined">
          <strong>AI Confidence:</strong> {{ event.aiConfidence * 100 | number:'1.0-0' }}%
        </div>
        <button (click)="approve.emit(i)">Approve</button>
        <button (click)="reject.emit(i)">Reject</button>
      </div>
    </div>
    <div *ngIf="reviewEvents.length === 0" class="review-queue-empty">
      <p>No pending review events.</p>
    </div>
  `,
  styles: [`
    .review-queue { background: #fffbe7; border: 1px solid #ffe066; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; }
    .review-event { margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #eee; }
    .review-event:last-child { border-bottom: none; }
    .old { color: #b91c1c; text-decoration: line-through; }
    .new { color: #15803d; font-weight: bold; }
    button { margin-right: 0.5rem; }
    .review-queue-empty { color: #888; text-align: center; }
  `],
  standalone: true,
  imports: [CommonModule]
})
export class SkuReviewQueueComponent {
  @Input() reviewEvents: ReviewEvent[] = [];
  @Output() approve = new EventEmitter<number>();
  @Output() reject = new EventEmitter<number>();
  
  diffKeys(diff: Partial<DrugSKU>): SkuKey[] {
    return Object.keys(diff) as SkuKey[];
  }

  getSkuValue(sku: DrugSKU, key: SkuKey): string {
    return sku[key] as string;
  }

  getDiffValue(diff: Partial<DrugSKU>, key: SkuKey): string | undefined {
    return diff[key] as string;
  }
}
