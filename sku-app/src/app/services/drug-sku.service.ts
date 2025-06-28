import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, catchError, of, switchMap } from 'rxjs';
import { DrugSKU, SKUStatus, SKUSearchCriteria } from '../models/drug-sku.model';

@Injectable({
  providedIn: 'root'
})
export class SkuService {
  private apiUrl = 'http://localhost:5000/api';
  private currentSKUSubject = new BehaviorSubject<DrugSKU | null>(null);

  constructor(private http: HttpClient) {}

  // Error handling method
  private handleError = (error: HttpErrorResponse) => {
    console.error('API Error:', error);
    
    let errorMessage = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error: ${error.status} ${error.statusText}`;
      if (error.error?.detail) {
        errorMessage += ` - ${error.error.detail}`;
      }
    }
    
    // Return an observable with a user-facing error message
    return throwError(() => new Error(errorMessage));
  }

  // Get SKU by ID
  getSKU(id: string): Observable<DrugSKU> {
    return this.http.get<DrugSKU>(`${this.apiUrl}/skus/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Create new SKU
  createSKU(skuData: DrugSKU): Observable<DrugSKU> {
    // Convert Date objects to strings for API compatibility
    const apiData = {
      ...skuData,
      created_at: skuData.created_at instanceof Date ? skuData.created_at.toISOString() : undefined,
      last_modified: skuData.last_modified instanceof Date ? skuData.last_modified.toISOString() : undefined
    };
    
    // Enhanced logging for debugging
    console.log('Creating SKU with data (before JSON):', apiData);
    console.log('Creating SKU JSON payload:', JSON.stringify(apiData));
    
    // For debugging, directly use the Fetch API to see raw response
    return new Observable<DrugSKU>(observer => {
      fetch(`${this.apiUrl}/skus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      })
      .then(response => {
        console.log('Create SKU response status:', response.status);
        if (!response.ok) {
          return response.text().then(text => {
            try {
              const errorJson = JSON.parse(text);
              console.error('Server error details:', errorJson);
              throw new Error(`Server error: ${errorJson.detail || 'Unknown error'}`);
            } catch (e) {
              console.error('Raw server error:', text);
              throw new Error(`Server error: ${text || 'Unknown error'}`);
            }
          });
        }
        return response.json();
      })
      .then(data => {
        console.log('Create SKU success response:', data);
        observer.next(data);
        observer.complete();
      })
      .catch(error => {
        console.error('Error creating SKU (detailed):', error);
        observer.error(new Error(`Failed to create SKU: ${error.message}`));
      });
    });
  }

  // Update SKU
  updateSKU(id: string, skuData: Partial<DrugSKU>): Observable<DrugSKU> {
    return this.http.put<DrugSKU>(`${this.apiUrl}/skus/${id}`, skuData).pipe(
      catchError(this.handleError)
    );
  }

  // Partial update SKU (PATCH)
  partialUpdateSKU(id: string, skuData: Partial<DrugSKU>): Observable<DrugSKU> {
    return this.http.patch<DrugSKU>(`${this.apiUrl}/skus/${id}`, skuData).pipe(
      catchError(this.handleError)
    );
  }

  // Delete SKU (soft delete)
  deleteSKU(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/skus/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Search SKUs by name (simple string search)
  searchSKUs(name: string): Observable<{ items: DrugSKU[], total: number }> {
    console.log('Service searchSKUs called with name:', name);
    let params = new HttpParams();
    
    if (name && name.trim() !== '') {
      params = params.set('name', name.trim());
    }
    
    console.log('Search params:', params.toString());
    
    return this.http.get<{ items: DrugSKU[], total: number }>(
      `${this.apiUrl}/skus`, 
      { params }
    ).pipe(
      catchError((error) => {
        console.error('HTTP error in searchSKUs:', error);
        return this.handleError(error);
      })
    );
  }

  // Get all SKUs
  getAllSKUs(): Observable<{ items: DrugSKU[], total: number }> {
    console.log('Service getAllSKUs called');
    
    return this.http.get<{ items: DrugSKU[], total: number }>(`${this.apiUrl}/skus`).pipe(
      catchError((error) => {
        console.error('HTTP error in getAllSKUs:', error);
        return this.handleError(error);
      })
    );
  }

  // Advanced search with criteria
  searchSKUsByCriteria(criteria: SKUSearchCriteria): Observable<{ items: DrugSKU[], total: number }> {
    let params = new HttpParams();
    Object.entries(criteria).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.append(key, value.toString());
      }
    });
    return this.http.get<{ items: DrugSKU[], total: number }>(`${this.apiUrl}/skus`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  // Extract data from image
  extractFromImage(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/extract-ocr`, formData).pipe(
      catchError(this.handleError)
    );
  }

  // Upload product image
  uploadImage(file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/upload`, formData).pipe(
      catchError(this.handleError)
    );
  }

  // Get current SKU
  getCurrentSKU(): Observable<DrugSKU | null> {
    return this.currentSKUSubject.asObservable();
  }

  // Set current SKU
  setCurrentSKU(sku: DrugSKU | null): void {
    this.currentSKUSubject.next(sku);
  }

  // Get SKU by NDC code
  getSKUByNDC(ndc: string): Observable<DrugSKU> {
    console.log('Service: Looking up SKU by NDC:', ndc);
    
    // Use the search endpoint with ndc parameter
    return this.http.get<{ items: DrugSKU[], total: number }>(`${this.apiUrl}/skus?ndc=${encodeURIComponent(ndc)}`).pipe(
      catchError(this.handleError),
      switchMap(response => {
        console.log('Service: NDC search response:', response);
        
        if (response.items && response.items.length > 0) {
          // Return the first matching SKU
          return of(response.items[0]);
        } else {
          return throwError(() => new Error(`No SKU found with NDC: ${ndc}`));
        }
      })
    );
  }

  // Find duplicates
  findDuplicates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/skus/duplicates`);
  }
}
