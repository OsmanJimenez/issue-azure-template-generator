import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonList, IonItem, IonLabel, IonChip, IonIcon } from '@ionic/angular/standalone';
import { IssueService } from '../services/issue.service';
import { IssueHistory } from '../models/issue.model';
import { addIcons } from 'ionicons';
import { close, time } from 'ionicons/icons';

@Component({
  selector: 'app-issue-history',
  template: `
    <ion-modal [isOpen]="isOpen" (didDismiss)="onClose()">
      <ion-header>
        <ion-toolbar>
          <ion-title>Historial de Versiones</ion-title>
          <ion-button slot="end" fill="clear" (click)="onClose()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item *ngFor="let entry of history">
            <ion-label>
              <h3>Versión {{ entry.version }}</h3>
              <p>{{ entry.updatedAt | date:'medium' }}</p>
              <div class="action-chip">
                <ion-chip [color]="getActionColor(entry.action)">
                  {{ getActionLabel(entry.action) }}
                </ion-chip>
              </div>
            </ion-label>
          </ion-item>
        </ion-list>
        <div *ngIf="history.length === 0" class="empty-history">
          <p>No hay historial disponible</p>
        </div>
      </ion-content>
    </ion-modal>
  `,
  styles: [`
    .action-chip {
      margin-top: 8px;
    }
    .empty-history {
      text-align: center;
      padding: 40px;
      color: var(--ion-color-medium);
    }
  `],
  imports: [CommonModule, IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonList, IonItem, IonLabel, IonChip, IonIcon]
})
export class IssueHistoryComponent implements OnInit {
  @Input() issueId: string = '';
  @Input() isOpen: boolean = false;
  
  history: IssueHistory[] = [];

  constructor(private issueService: IssueService) {
    addIcons({ close, time });
  }

  ngOnInit() {
    if (this.issueId) {
      this.loadHistory();
    }
  }

  loadHistory() {
    this.history = this.issueService.getIssueHistory(this.issueId);
  }

  onClose() {
    this.isOpen = false;
  }

  getActionColor(action: string): string {
    switch (action) {
      case 'created': return 'success';
      case 'updated': return 'warning';
      case 'deleted': return 'danger';
      default: return 'medium';
    }
  }

  getActionLabel(action: string): string {
    switch (action) {
      case 'created': return 'Creado';
      case 'updated': return 'Actualizado';
      case 'deleted': return 'Eliminado';
      default: return action;
    }
  }
}