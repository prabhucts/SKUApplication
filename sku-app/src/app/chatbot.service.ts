import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { DrugSKU, SKUStatus } from './models/drug-sku.model';
import { SkuService } from './services/drug-sku.service';

export interface ChatRequest {
  text: string;
}

export interface ChatResponse {
  reply: string;
  action?: string;
  data?: any;
  intent?: string;
  skuDetails?: Partial<DrugSKU> | { searchTerm: string };
  confirmationRequired?: boolean;
  confirmationType?: string;
  changes?: Record<string, any>;
}

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private apiUrl = 'http://localhost:5000/api';
  private knownSkus: { [ndc: string]: DrugSKU } = {};

  constructor(
    private http: HttpClient,
    private skuService: SkuService
  ) {
    this.loadAllSkus();
  }

  private loadAllSkus(): void {
    this.skuService.getAllSKUs().subscribe({
      next: (response) => {
        this.knownSkus = {};
        response.items.forEach(sku => {
          this.knownSkus[sku.ndc] = sku;
        });
        console.log(`Loaded ${Object.keys(this.knownSkus).length} SKUs into chatbot context`);
      },
      error: (error) => {
        console.error('Error loading SKUs for chatbot context:', error);
      }
    });
  }

  // Process user message and detect intent/entities
  processMessage(message: string): Observable<ChatResponse> {
    // Clean the message
    const cleanMessage = message.trim().toLowerCase();
    
    // Check for SKU addition intent
    if (this.isAddSkuIntent(cleanMessage)) {
      return this.handleAddSkuIntent(cleanMessage);
    }
    
    // Check for SKU edit intent
    if (this.isEditSkuIntent(cleanMessage)) {
      return this.handleEditSkuIntent(cleanMessage);
    }
    
    // Check for SKU search intent
    if (this.isSearchSkuIntent(cleanMessage)) {
      return this.handleSearchSkuIntent(cleanMessage);
    }
    
    // Check for SKU deletion intent
    if (this.isDeleteSkuIntent(cleanMessage)) {
      return this.handleDeleteSkuIntent(cleanMessage);
    }
    
    // Default response for unknown intents
    return of({
      reply: "I'm not sure what you want to do with SKUs. You can say things like 'add a new SKU', 'edit SKU 12345-678-90', 'search for ibuprofen', or 'delete SKU 12345-678-90'."
    });
  }

  // Intent detection methods
  private isAddSkuIntent(message: string): boolean {
    return /(add|create|new) (a |new |)sku/i.test(message);
  }
  
  private isEditSkuIntent(message: string): boolean {
    return /(edit|update|modify|change) (sku|drug) ([A-Za-z0-9\\-]+)/i.test(message);
  }
  
  private isSearchSkuIntent(message: string): boolean {
    return /(search|find|get|list) (for |)(all |)((sku|drug)s|sku|drug)/i.test(message);
  }
  
  private isDeleteSkuIntent(message: string): boolean {
    return /(delete|remove) (sku|drug) ([A-Za-z0-9\\-]+)/i.test(message);
  }

  // Intent handlers
  private handleAddSkuIntent(message: string): Observable<ChatResponse> {
    // Extract potential product information from the message
    const nameMatch = message.match(/for ([a-z0-9 ]+)( by | from |)([a-z0-9 ]+)?/i);
    
    let skuDetails: Partial<DrugSKU> = {
      ndc: '',
      name: nameMatch ? nameMatch[1].trim() : '',
      manufacturer: (nameMatch && nameMatch[3]) ? nameMatch[3].trim() : '',
      status: SKUStatus.DRAFT
    };
    
    // Check for potential duplicate names
    const similarSkus = Object.values(this.knownSkus).filter(
      sku => sku.name.toLowerCase().includes(skuDetails.name?.toLowerCase() || '')
    );
    
    if (similarSkus.length > 0) {
      return of({
        reply: `I found existing SKUs with similar names. Did you mean one of these?\n${
          similarSkus.slice(0, 3).map(sku => `- ${sku.name} (${sku.ndc})`).join('\n')
        }`,
        intent: 'add',
        skuDetails
      });
    }
    
    return of({
      reply: "Let's add a new SKU. Please provide the following details or use the form below:",
      intent: 'add',
      action: 'showForm',
      skuDetails
    });
  }

  private handleEditSkuIntent(message: string): Observable<ChatResponse> {
    const match = message.match(/(edit|update|modify|change) (sku|drug) ([A-Za-z0-9\\-]+)/i);
    if (!match || !match[3]) {
      return of({
        reply: "Which SKU would you like to edit? Please provide the NDC code.",
        intent: 'edit'
      });
    }
    
    const ndcCode = match[3];
    console.log('Chatbot: Attempting to edit SKU with NDC:', ndcCode);
    
    // First try direct search
    return this.skuService.searchSKUs(ndcCode).pipe(
      switchMap(response => {
        console.log('Chatbot: Search results for NDC edit:', response);
        
        // If we found matching SKUs, try to find exact or close match
        if (response.items && response.items.length > 0) {
          // Try exact match first
          const exactMatch = response.items.find(sku => sku.ndc === ndcCode);
          
          // If exact match found
          if (exactMatch) {
            console.log('Chatbot: Found exact matching SKU:', exactMatch);
            return of({
              reply: `Found SKU: ${exactMatch.name} (${exactMatch.ndc}). What would you like to change?`,
              intent: 'edit',
              action: 'showForm',
              skuDetails: exactMatch
            });
          }
          
          // Try to find a similar match (NDC can be formatted differently)
          const cleanNdc = ndcCode.replace(/\-/g, ''); // Remove all hyphens
          
          const similarMatch = response.items.find(sku => {
            const cleanSkuNdc = sku.ndc.replace(/\-/g, '');
            return cleanSkuNdc === cleanNdc || sku.ndc.includes(ndcCode) || ndcCode.includes(sku.ndc);
          });
          
          if (similarMatch) {
            console.log('Chatbot: Found similar matching SKU:', similarMatch);
            return of({
              reply: `Found SKU: ${similarMatch.name} (${similarMatch.ndc}). What would you like to change?`,
              intent: 'edit',
              action: 'showForm',
              skuDetails: similarMatch
            });
          }
          
          // If we found some SKUs but no match, show the first few results
          console.log('Chatbot: No exact or similar match, showing options');
          const skuList = response.items.slice(0, 3).map(sku => `- ${sku.name} (${sku.ndc})`).join('\n');
          return of({
            reply: `I couldn't find an exact match for "${ndcCode}". Did you mean one of these?\n${skuList}\nPlease try again with the exact NDC code.`,
            intent: 'edit'
          });
        }
        
        // Fall back to getSKUByNDC as a last resort
        return this.skuService.getSKUByNDC(ndcCode).pipe(
          switchMap(sku => {
            console.log('Chatbot: Found SKU with getSKUByNDC:', sku);
            return of({
              reply: `Found SKU: ${sku.name} (${sku.ndc}). What would you like to change?`,
              intent: 'edit',
              action: 'showForm',
              skuDetails: sku
            });
          }),
          catchError(err => {
            console.log('Chatbot: Error finding SKU:', err);
            return of({
              reply: `I couldn't find an SKU with NDC code "${ndcCode}". Please check the code and try again.`,
              intent: 'edit'
            });
          })
        );
      }),
      catchError(err => {
        console.log('Chatbot: Error in search process:', err);
        return of({
          reply: `I'm having trouble finding that SKU. Please try again with a different NDC code.`,
          intent: 'edit'
        });
      })
    );
  }

  private handleSearchSkuIntent(message: string): Observable<ChatResponse> {
    // Extract search term with improved regex pattern
    const searchTermMatch = message.match(/(search|find|get|list)( for| all)?( skus?| drugs?)?( with| containing| named| like)?[ ]?([a-z0-9 ]+)?/i);
    console.log('Search term match:', searchTermMatch);
    
    // If group 5 exists, it's our search term
    let searchTerm = '';
    if (searchTermMatch) {
      // The search term could be in group 5
      searchTerm = searchTermMatch[5] ? searchTermMatch[5].trim() : '';
    }
    
    console.log('Chatbot: Searching for term:', searchTerm ? `"${searchTerm}"` : 'ALL SKUs');
    
    if (!searchTerm) {
      return this.skuService.getAllSKUs().pipe(
        map(response => {
          console.log('Chatbot: All SKUs search results:', response);
          const skuCount = response.items.length;
          const skuList = response.items.slice(0, 5).map(sku => `- ${sku.name} (${sku.ndc})`).join('\n');
          
          return {
            reply: `Found ${skuCount} SKUs. Here are the first 5:\n${skuList}${skuCount > 5 ? '\n...and more' : ''}`,
            intent: 'search',
            action: 'showSearchResults',
            skuDetails: {
              searchTerm: ''
            }
          };
        }),
        catchError(error => {
          console.log('Chatbot: Error getting all SKUs:', error);
          return of({
            reply: `I had trouble retrieving SKUs. Error: ${error.message}`,
            intent: 'search'
          });
        })
      );
    } else {
      return this.skuService.searchSKUs(searchTerm).pipe(
        map(response => {
          console.log('Chatbot: Search results for term:', searchTerm, response);
          
          if (response.items.length === 0) {
            return {
              reply: `I couldn't find any SKUs matching "${searchTerm}".`,
              intent: 'search'
            };
          }
          
          const skuList = response.items.map(sku => `- ${sku.name} (${sku.ndc})`).join('\n');
          
          return {
            reply: `Found ${response.items.length} SKUs matching "${searchTerm}":\n${skuList}`,
            intent: 'search',
            action: 'showSearchResults',
            skuDetails: {
              searchTerm: searchTerm
            }
          };
        }),
        catchError(error => {
          console.log('Chatbot: Error searching for term:', searchTerm, error);
          return of({
            reply: `I had trouble searching for "${searchTerm}". Error: ${error.message}`,
            intent: 'search'
          });
        })
      );
    }
  }

  private handleDeleteSkuIntent(message: string): Observable<ChatResponse> {
    const match = message.match(/(delete|remove) (sku|drug) ([A-Za-z0-9\\-]+)/i);
    if (!match || !match[3]) {
      return of({
        reply: "Which SKU would you like to delete? Please provide the NDC code.",
        intent: 'delete'
      });
    }
    
    const ndcCode = match[3];
    console.log('Chatbot: Attempting to delete SKU with NDC:', ndcCode);
    
    // First try search to find matching SKUs
    return this.skuService.searchSKUs(ndcCode).pipe(
      switchMap(response => {
        console.log('Chatbot: Search results for NDC delete:', response);
        
        // If we found matching SKUs, try to find exact or close match
        if (response.items && response.items.length > 0) {
          // Try exact match first
          const exactMatch = response.items.find(sku => sku.ndc === ndcCode);
          
          // If exact match found
          if (exactMatch) {
            console.log('Chatbot: Found exact matching SKU for delete:', exactMatch);
            return of({
              reply: `Are you sure you want to delete the SKU "${exactMatch.name}" (${exactMatch.ndc})? This action cannot be undone.`,
              intent: 'delete',
              action: 'confirmDelete',
              skuDetails: exactMatch,
              confirmationRequired: true,
              confirmationType: 'delete' as 'delete'
            });
          }
          
          // Try to find a similar match (NDC can be formatted differently)
          const cleanNdc = ndcCode.replace(/\-/g, ''); // Remove all hyphens
          
          const similarMatch = response.items.find(sku => {
            const cleanSkuNdc = sku.ndc.replace(/\-/g, '');
            return cleanSkuNdc === cleanNdc || sku.ndc.includes(ndcCode) || ndcCode.includes(sku.ndc);
          });
          
          if (similarMatch) {
            console.log('Chatbot: Found similar matching SKU for delete:', similarMatch);
            return of({
              reply: `Are you sure you want to delete the SKU "${similarMatch.name}" (${similarMatch.ndc})? This action cannot be undone.`,
              intent: 'delete',
              action: 'confirmDelete',
              skuDetails: similarMatch,
              confirmationRequired: true,
              confirmationType: 'delete' as 'delete'
            });
          }
          
          // If we found some SKUs but no match, show the first few results
          console.log('Chatbot: No exact or similar match for delete, showing options');
          const skuList = response.items.slice(0, 3).map(sku => `- ${sku.name} (${sku.ndc})`).join('\n');
          return of({
            reply: `I couldn't find an exact match for "${ndcCode}". Did you mean one of these?\n${skuList}\nPlease try again with the exact NDC code.`,
            intent: 'delete'
          });
        }
        
        // Fall back to getSKUByNDC as a last resort
        return this.skuService.getSKUByNDC(ndcCode).pipe(
          switchMap(sku => {
            console.log('Chatbot: Found SKU with getSKUByNDC for delete:', sku);
            return of({
              reply: `Are you sure you want to delete the SKU "${sku.name}" (${sku.ndc})? This action cannot be undone.`,
              intent: 'delete',
              action: 'confirmDelete',
              skuDetails: sku,
              confirmationRequired: true,
              confirmationType: 'delete' as 'delete'
            });
          }),
          catchError(err => {
            console.log('Chatbot: Error finding SKU for delete:', err);
            return of({
              reply: `I couldn't find an SKU with NDC code "${ndcCode}". Please check the code and try again.`,
              intent: 'delete'
            });
          })
        );
      }),
      catchError(err => {
        console.log('Chatbot: Error in search process for delete:', err);
        return of({
          reply: `I'm having trouble finding that SKU. Please try again with a different NDC code.`,
          intent: 'delete'
        });
      })
    );
  }

  // Validation methods for SKU changes
  validateSkuChanges(original: DrugSKU, updated: Partial<DrugSKU>): ChatResponse {
    const changes: { [key: string]: { old: any, new: any } } = {};
    let hasChanges = false;
    
    // Check each field for changes
    for (const key of Object.keys(updated) as (keyof DrugSKU)[]) {
      if (key === 'id' || key === 'created_at' || key === 'image_url' || key === 'gtin') continue;
      
      if (updated[key] !== undefined && updated[key] !== original[key]) {
        changes[key] = { old: original[key], new: updated[key] };
        hasChanges = true;
      }
    }
    
    if (!hasChanges) {
      return {
        reply: "There are no changes to apply to this SKU.",
        intent: 'edit',
        skuDetails: original
      };
    }
    
    // Format the changes for display
    const changesList = Object.entries(changes).map(([field, values]) => {
      const fieldName = field.replace('_', ' ');
      return `- ${fieldName}: "${values.old}" → "${values.new}"`;
    }).join('\n');
    
    return {
      reply: `You're about to make the following changes to SKU ${original.ndc}:\n${changesList}\n\nDo you want to proceed with these changes?`,
      intent: 'edit',
      action: 'confirmChanges',
      skuDetails: updated,
      confirmationRequired: true,
      confirmationType: 'update',
      changes
    };
  }
  
  // Check for duplicate SKUs
  checkForDuplicateNdc(ndc: string): Observable<boolean> {
    return this.skuService.searchSKUs(ndc).pipe(
      map(response => response.items.some(sku => sku.ndc === ndc)),
      catchError(() => of(false))
    );
  }
  
  // Original method for backward compatibility
  sendMessage(request: ChatRequest): Observable<ChatResponse> {
    return this.processMessage(request.text);
  }
}
