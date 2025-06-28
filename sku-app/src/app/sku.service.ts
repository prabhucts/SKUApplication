import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Sku {
  skuNumber: string;
  ndc: string;
  productName: string;
  manufacturer: string;
  strength: string;
  form: string;
  packageSize: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class SkuService {
  private apiUrl = '/api/skus';

  constructor(private http: HttpClient) {}

  searchSkus(query: string): Observable<Sku[]> {
    return this.http.get<Sku[]>(`${this.apiUrl}?search=${encodeURIComponent(query)}`);
  }

  getSku(skuNumber: string): Observable<Sku> {
    return this.http.get<Sku>(`${this.apiUrl}/${skuNumber}`);
  }

  addSku(sku: Sku): Observable<Sku> {
    return this.http.post<Sku>(this.apiUrl, sku);
  }

  updateSku(skuNumber: string, sku: Sku): Observable<Sku> {
    return this.http.put<Sku>(`${this.apiUrl}/${skuNumber}`, sku);
  }

  deleteSku(skuNumber: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${skuNumber}`);
  }
}
