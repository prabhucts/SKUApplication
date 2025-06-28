import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DrugSKU } from '../models/drug-sku.model';
import { SkuService } from './drug-sku.service';

export interface ChangeNotification {
  id: string;
  type: 'context_change' | 'ocr_change' | 'dataset_change';
  skuId?: string;
  oldData: Partial<DrugSKU>;
  newData: Partial<DrugSKU>;
  changes: SkuFieldChange[];
  source: 'chat_context' | 'dataset' | 'ocr';
  timestamp: Date;
  confidence?: number;
  message: string;
  actionRequired: boolean;
}

export interface SkuFieldChange {
  field: keyof DrugSKU;
  oldValue: string | null;
  newValue: string | null;
  changeType: 'added' | 'modified' | 'removed';
}

export interface ChatContext {
  sessionId: string;
  messages: ChatMessage[];
  mentionedSkus: string[]; // NDC codes
  createdSkus: DrugSKU[];
  modifiedSkus: DrugSKU[];
}

export interface ChatMessage {
  id: string;
  timestamp: Date;
  user: boolean;
  text: string;
  extractedData?: Partial<DrugSKU>;
  skuReferences?: string[]; // NDC codes mentioned
}

@Injectable({
  providedIn: 'root'
})
export class ChangeDetectionService {
  private readonly STORAGE_KEY = 'sku_chat_context';
  private changeNotificationsSubject = new BehaviorSubject<ChangeNotification[]>([]);
  private chatContextSubject = new BehaviorSubject<ChatContext | null>(null);
  
  changeNotifications$ = this.changeNotificationsSubject.asObservable();
  chatContext$ = this.chatContextSubject.asObservable();

  constructor(private skuService: SkuService) {
    this.loadChatContext();
  }

  // Initialize or load chat context
  private loadChatContext(): void {
    // Check if we're in browser environment
    if (typeof localStorage === 'undefined') {
      this.initializeNewContext();
      return;
    }
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const context: ChatContext = JSON.parse(stored);
        // Convert date strings back to Date objects
        context.messages = context.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        this.chatContextSubject.next(context);
      } catch (error) {
        console.error('Failed to load chat context:', error);
        this.initializeNewContext();
      }
    } else {
      this.initializeNewContext();
    }
  }

  private initializeNewContext(): void {
    const newContext: ChatContext = {
      sessionId: this.generateSessionId(),
      messages: [],
      mentionedSkus: [],
      createdSkus: [],
      modifiedSkus: []
    };
    this.chatContextSubject.next(newContext);
    this.saveChatContext(newContext);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveChatContext(context: ChatContext): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(context));
    }
  }

  // Add message to chat context
  addChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): void {
    const context = this.chatContextSubject.value;
    if (!context) return;

    const chatMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    // Extract SKU references from message
    if (message.text) {
      const ndcPattern = /\b\d{4,5}-\d{2,4}-\d{1,2}\b/g;
      const matches = message.text.match(ndcPattern);
      if (matches) {
        chatMessage.skuReferences = matches;
        // Add to mentioned SKUs
        matches.forEach(ndc => {
          if (!context.mentionedSkus.includes(ndc)) {
            context.mentionedSkus.push(ndc);
          }
        });
      }
    }

    context.messages.push(chatMessage);
    this.chatContextSubject.next(context);
    this.saveChatContext(context);
  }

  // Track SKU creation from chat
  trackSkuCreation(sku: DrugSKU): void {
    const context = this.chatContextSubject.value;
    if (!context) return;

    context.createdSkus.push(sku);
    if (!context.mentionedSkus.includes(sku.ndc)) {
      context.mentionedSkus.push(sku.ndc);
    }

    this.chatContextSubject.next(context);
    this.saveChatContext(context);
  }

  // Detect changes from external dataset
  detectDatasetChanges(datasetSkus: DrugSKU[]): void {
    const context = this.chatContextSubject.value;
    if (!context) return;

    // Check mentioned SKUs for changes
    context.mentionedSkus.forEach(ndc => {
      const datasetSku = datasetSkus.find(sku => sku.ndc === ndc);
      if (datasetSku) {
        this.checkForChanges(ndc, datasetSku, 'dataset');
      }
    });

    // Check created SKUs for changes
    context.createdSkus.forEach(createdSku => {
      const datasetSku = datasetSkus.find(sku => sku.ndc === createdSku.ndc);
      if (datasetSku) {
        this.checkForChanges(createdSku.ndc, datasetSku, 'dataset', createdSku);
      }
    });
  }

  // Detect changes from OCR data
  detectOcrChanges(ocrData: Partial<DrugSKU>, confidence: number): void {
    if (!ocrData.ndc) return;

    // Check if this SKU was mentioned or created in chat
    const context = this.chatContextSubject.value;
    if (!context) return;

    const isRelevant = context.mentionedSkus.includes(ocrData.ndc) || 
                      context.createdSkus.some(sku => sku.ndc === ocrData.ndc);

    if (isRelevant) {
      this.skuService.getSKU(ocrData.ndc).subscribe({
        next: (existingSku) => {
          if (existingSku) {
            this.checkForChanges(ocrData.ndc!, ocrData as DrugSKU, 'ocr', existingSku, confidence);
          }
        },
        error: (error) => {
          console.log('SKU not found in database, OCR data for new SKU:', ocrData);
        }
      });
    }
  }

  private checkForChanges(
    ndc: string, 
    newData: DrugSKU, 
    source: 'dataset' | 'ocr' | 'chat_context',
    oldData?: DrugSKU, 
    confidence?: number
  ): void {
    // Get existing SKU data if not provided
    if (!oldData) {
      this.skuService.getSKU(ndc).subscribe({
        next: (existingSku) => {
          if (existingSku) {
            this.performChangeComparison(ndc, existingSku, newData, source, confidence);
          }
        },
        error: (error) => {
          console.log('SKU not found in database:', ndc);
        }
      });
    } else {
      this.performChangeComparison(ndc, oldData, newData, source, confidence);
    }
  }

  private performChangeComparison(
    ndc: string,
    oldData: DrugSKU,
    newData: DrugSKU,
    source: 'dataset' | 'ocr' | 'chat_context',
    confidence?: number
  ): void {
    const changes: SkuFieldChange[] = [];
    const fields: (keyof DrugSKU)[] = ['name', 'manufacturer', 'dosage_form', 'strength', 'package_size'];

    fields.forEach(field => {
      const oldValue = oldData[field] as string;
      const newValue = newData[field] as string;

      if (oldValue !== newValue) {
        changes.push({
          field,
          oldValue: oldValue || null,
          newValue: newValue || null,
          changeType: !oldValue ? 'added' : !newValue ? 'removed' : 'modified'
        });
      }
    });

    if (changes.length > 0) {
      const notification: ChangeNotification = {
        id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: source === 'dataset' ? 'dataset_change' : source === 'ocr' ? 'ocr_change' : 'context_change',
        skuId: ndc,
        oldData,
        newData,
        changes,
        source,
        timestamp: new Date(),
        confidence,
        message: this.generateChangeMessage(ndc, changes, source),
        actionRequired: true
      };

      this.addChangeNotification(notification);
    }
  }

  private generateChangeMessage(ndc: string, changes: SkuFieldChange[], source: string): string {
    const changeCount = changes.length;
    const sourceText = source === 'dataset' ? 'external dataset' : 
                      source === 'ocr' ? 'OCR processing' : 'context analysis';
    
    return `Changes detected for SKU ${ndc} from ${sourceText}. ${changeCount} field${changeCount > 1 ? 's' : ''} modified. Would you like to review and update?`;
  }

  private addChangeNotification(notification: ChangeNotification): void {
    const current = this.changeNotificationsSubject.value;
    const updated = [notification, ...current];
    this.changeNotificationsSubject.next(updated);
  }

  // Get pending notifications
  getPendingNotifications(): ChangeNotification[] {
    return this.changeNotificationsSubject.value.filter(n => n.actionRequired);
  }

  // Mark notification as handled
  handleNotification(notificationId: string, action: 'approved' | 'rejected'): void {
    const notifications = this.changeNotificationsSubject.value;
    const notification = notifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.actionRequired = false;
      
      if (action === 'approved') {
        // Apply changes to the SKU
        this.skuService.updateSKU(notification.skuId!, notification.newData).subscribe({
          next: (updatedSku) => {
            console.log('SKU updated successfully:', updatedSku);
            // Track modification in chat context
            this.trackSkuModification(updatedSku);
          },
          error: (error) => {
            console.error('Failed to update SKU:', error);
          }
        });
      }
      
      this.changeNotificationsSubject.next([...notifications]);
    }
  }

  private trackSkuModification(sku: DrugSKU): void {
    const context = this.chatContextSubject.value;
    if (!context) return;

    const existingIndex = context.modifiedSkus.findIndex(s => s.ndc === sku.ndc);
    if (existingIndex >= 0) {
      context.modifiedSkus[existingIndex] = sku;
    } else {
      context.modifiedSkus.push(sku);
    }

    this.chatContextSubject.next(context);
    this.saveChatContext(context);
  }

  // Clear notifications
  clearNotifications(): void {
    this.changeNotificationsSubject.next([]);
  }

  // Reset chat context (for new session)
  resetChatContext(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.initializeNewContext();
    this.clearNotifications();
  }

  // Get chat statistics
  getChatStats(): any {
    const context = this.chatContextSubject.value;
    if (!context) return null;

    return {
      sessionId: context.sessionId,
      messageCount: context.messages.length,
      mentionedSkusCount: context.mentionedSkus.length,
      createdSkusCount: context.createdSkus.length,
      modifiedSkusCount: context.modifiedSkus.length,
      pendingNotifications: this.getPendingNotifications().length
    };
  }
}
