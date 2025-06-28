import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { DrugSKU, SKUStatus, SKUSearchCriteria } from '../models/drug-sku.model';

@Injectable({
  providedIn: 'root'
})
export class SkuService {
  private apiUrl = 'http://localhost:5000/api'; // FastAPI backend URL
  private currentSKUSubject = new BehaviorSubject<DrugSKU | null>(null);

  constructor(private http: HttpClient) {}

  // Get SKU by ID
  getSKU(id: string): Observable<DrugSKU> {
    return this.http.get<DrugSKU>(`${this.apiUrl}/skus/${id}`);
  }

  // Create new SKU
  createSKU(skuData: DrugSKU): Observable<DrugSKU> {
    return this.http.post<DrugSKU>(`${this.apiUrl}/skus`, skuData);
  }

  // Update SKU
  updateSKU(id: string, skuData: Partial<DrugSKU>): Observable<DrugSKU> {
    return this.http.put<DrugSKU>(`${this.apiUrl}/skus/${id}`, skuData);
  }

  // Delete SKU
  deleteSku(sku: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/skus/${sku}`);
  }

  // Search SKUs
  searchSkus(query: string): Observable<DrugSKU[]> {
    return this.http.get<DrugSKU[]>(`${this.apiUrl}/skus/search`, {
      params: { q: query }
    });
  }

  // Upload image
  uploadImage(file: File): Observable<{imageUrl: string}> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{imageUrl: string}>(`${this.apiUrl}/upload`, formData);
  }
} 