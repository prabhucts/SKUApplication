import { Component } from '@angular/core';
import { ChatbotService, ChatRequest, ChatResponse } from './chatbot.service';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SkuService } from './services/drug-sku.service';
import { DrugSKU, SKUSearchCriteria, SKUStatus } from './models/drug-sku.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

interface ChatMessage {
  text: string;
  user: boolean;
  duplicates?: DuplicateGroup[];
}

interface DuplicateGroup {
  ndc: string;
  name: string;
  records: DrugSKU[];
}

@Component({
  selector: 'sku-chatbot',
  template: `
    <div class="chatbot-container">
      <div class="chat-messages">
        <div *ngFor="let msg of messages" [class.user]="msg.user" [class.bot]="!msg.user">
          <span>{{ msg.text }}</span>
          <div *ngIf="msg.duplicates" class="duplicates-table">
            <h4>Duplicate SKUs Found:</h4>
            <div *ngFor="let group of msg.duplicates" class="duplicate-group">
              <h5>{{ group.ndc }} - {{ group.name }}</h5>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>NDC</th>
                    <th>Name</th>
                    <th>Manufacturer</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let record of group.records">
                    <td>{{ record.id }}</td>
                    <td>{{ record.ndc }}</td>
                    <td>{{ record.name }}</td>
                    <td>{{ record.manufacturer }}</td>
                    <td>{{ record.status }}</td>
                    <td>
                      <button (click)="editDuplicate(record)">Edit</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <form (ngSubmit)="sendMessage()" class="chat-input-row">
        <input [(ngModel)]="input" name="chatInput" placeholder="Type your message..." autocomplete="off" />
        <button type="submit">Send</button>
      </form>
    </div>
  `,
  styles: [`
    .chatbot-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #f9f9f9;
      overflow: hidden;
    }
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: white;
    }
    .chat-messages div {
      margin-bottom: 12px;
      padding: 8px 12px;
      border-radius: 18px;
      max-width: 80%;
      word-wrap: break-word;
    }
    .chat-messages div.user {
      background-color: #e1f5fe;
      align-self: flex-end;
      margin-left: auto;
      text-align: right;
      color: #333; /* Ensure contrast for user messages */
    }
    .chat-messages div.bot {
      background-color: #f0f0f0;
      align-self: flex-start;
      color: #333; /* Ensure contrast for bot messages */
    }
    .chat-input-row {
      display: flex;
      padding: 12px;
      border-top: 1px solid #ddd;
      background: white;
    }
    .chat-input-row input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 20px;
      margin-right: 8px;
      outline: none;
      color: #333; /* Ensure contrast for input text */
    }
    .chat-input-row button {
      padding: 8px 16px;
      background-color: #0077C8;
      color: white;
      border: none;
      border-radius: 20px;
      cursor: pointer;
    }
    .chat-input-row button:hover {
      background-color: #005fa3;
    }
    .duplicates-table {
      margin: 10px 0;
      width: 100%;
    }
    .duplicates-table h4 {
      color: #333;
      margin-bottom: 10px;
    }
    .duplicate-group {
      margin: 15px 0;
      border: 1px solid #ddd;
      padding: 10px;
      border-radius: 4px;
      background-color: white;
    }
    .duplicate-group h5 {
      margin: 0 0 10px 0;
      color: #333;
    }
    .duplicate-group table {
      width: 100%;
      border-collapse: collapse;
    }
    .duplicate-group th, .duplicate-group td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #ddd;
      color: #333; /* Ensure contrast for table text */
    }
    .duplicate-group th {
      background-color: #f5f5f5;
      font-weight: bold;
      color: #333;
    }
    .duplicate-group button {
      padding: 4px 8px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .duplicate-group button:hover {
      background-color: #0056b3;
    }
  `],
  imports: [
    CommonModule,
    FormsModule
  ],
  standalone: true
})
export class ChatbotComponent {
  messages: ChatMessage[] = [];
  input = '';
  
  constructor(
    private chatbotService: ChatbotService,
    private skuService: SkuService,
    private router: Router
  ) {}

  private async handleDuplicatesCommand() {
    this.addMessage('Looking for duplicate SKUs...', false);
    try {
      const duplicates = await firstValueFrom(this.skuService.findDuplicates());
      if (!duplicates || duplicates.length === 0) {
        this.addMessage('No duplicate SKUs found in the database.', false);
      } else {
        this.messages.push({
          text: `Found ${duplicates.length} groups of duplicate SKUs:`,
          user: false,
          duplicates: duplicates
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.addMessage('Error checking for duplicates: ' + errorMessage, false);
    }
  }

  editDuplicate(sku: DrugSKU) {
    this.router.navigate(['/edit', sku.id]);
  }

  private addMessage(text: string, isUser: boolean) {
    this.messages.push({ text, user: isUser });
  }

  async sendMessage() {
    if (!this.input?.trim()) return;

    const userMessage = this.input.trim();
    this.addMessage(userMessage, true);
    this.input = '';

    // Check for duplicate detection command
    if (userMessage.toLowerCase().includes('duplicate') || 
        userMessage.toLowerCase().includes('find duplicates') ||
        userMessage.toLowerCase().includes('check duplicates')) {
      await this.handleDuplicatesCommand();
      return;
    }

    // Handle other chat commands
    try {
      const response = await firstValueFrom(this.chatbotService.sendMessage({ text: userMessage }));
      if (response) {
        this.addMessage(response.reply, false);
        
        // Handle navigation actions
        if (response.action === 'navigate' && response.data?.route) {
          if (response.data.queryParams) {
            this.router.navigate([response.data.route], { queryParams: response.data.queryParams });
          } else {
            this.router.navigate([response.data.route]);
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.addMessage('Error: ' + errorMessage, false);
    }
  }
}
