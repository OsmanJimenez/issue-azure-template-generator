import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { IssueService } from '../services/issue.service';
import { Feature } from '../models/issue.model';
import { addIcons } from 'ionicons';
import { trash, add, createOutline, close } from 'ionicons/icons';

@Component({
  selector: 'app-feature-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  template: `
    <div class="manager-container">
      <div class="md3-form-card" [class.editing]="editingFeatureId">
        <div class="card-header">
           <h3 class="section-title">{{ editingFeatureId ? 'Editar Feature' : 'Crear Feature' }}</h3>
           <ion-button *ngIf="editingFeatureId" fill="clear" size="small" (click)="cancelEdit()">
             <ion-icon name="close" slot="icon-only"></ion-icon>
           </ion-button>
        </div>
        
        <div class="input-group">
          <ion-label>Nombre</ion-label>
          <ion-input [(ngModel)]="newFeatureName" placeholder="Ej: Autenticación" (keyup.enter)="saveFeature()" fill="outline"></ion-input>
        </div>
        
        <div class="input-group">
          <ion-label>Descripción</ion-label>
          <ion-textarea [(ngModel)]="newFeatureDesc" placeholder="Breve descripción..." fill="outline" rows="2"></ion-textarea>
        </div>

        <div class="input-group">
          <ion-label>Color</ion-label>
          <div class="color-picker">
            <div 
              *ngFor="let color of predefinedColors" 
              class="color-circle" 
              [style.background]="color"
              [class.selected]="newFeatureColor === color"
              (click)="newFeatureColor = color">
              <span *ngIf="newFeatureColor === color" class="checkmark">✓</span>
            </div>
          </div>
        </div>

        <ion-button expand="block" (click)="saveFeature()" [disabled]="!newFeatureName" class="add-btn">
          <ion-icon [name]="editingFeatureId ? 'create-outline' : 'add'" slot="start"></ion-icon>
          {{ editingFeatureId ? 'Actualizar Feature' : 'Agregar Feature' }}
        </ion-button>
      </div>

      <div class="list-section">
        <h3 class="section-title">Features Disponibles ({{features.length}})</h3>
        
        <div class="md3-list">
          <div *ngFor="let feature of features" class="md3-list-item">
            <div class="item-start">
              <div class="color-indicator" [style.background]="feature.color"></div>
            </div>
            <div class="item-content">
              <div class="item-headline">{{ feature.name }}</div>
              <div class="item-supporting-text">{{ feature.description }}</div>
            </div>
            <div class="item-end">
              <ion-button fill="clear" (click)="editFeature(feature)">
                <ion-icon name="create-outline" slot="icon-only"></ion-icon>
              </ion-button>
              <ion-button fill="clear" color="danger" (click)="deleteFeature(feature.id)">
                <ion-icon name="trash" slot="icon-only"></ion-icon>
              </ion-button>
            </div>
          </div>
          
          <div *ngIf="features.length === 0" class="empty-state">
            <p>No hay features creadas aún.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .manager-container {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .section-title {
      font-size: 18px; 
      color: var(--md-sys-color-on-surface);
      margin: 0;
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .md3-form-card {
      background: var(--md-sys-color-surface-container);
      padding: 16px;
      border-radius: var(--md-sys-shape-corner-medium);
      transition: border 0.3s;
      border: 1px solid transparent;
    }
    
    .md3-form-card.editing {
      border-color: var(--md-sys-color-primary);
    }

    .input-group {
      margin-bottom: 16px;
      ion-label {
        display: block;
        margin-bottom: 8px;
        font-size: 12px;
        color: var(--md-sys-color-primary);
        font-weight: 500;
      }
    }

    .color-picker {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .color-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    }

    .color-circle.selected {
      transform: scale(1.1);
      box-shadow: 0 0 0 2px var(--md-sys-color-on-surface);
    }

    .checkmark {color: white; font-weight: bold; text-shadow: 0 0 2px black;}

    .md3-list { display: flex; flex-direction: column; gap: 8px; }

    .md3-list-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      background: var(--md-sys-color-surface-container);
      border-radius: var(--md-sys-shape-corner-small);
    }

    .item-start { margin-right: 16px; }
    .color-indicator { width: 40px; height: 40px; border-radius: 50%; }
    .item-content { flex: 1; }
    .item-headline { font-size: 16px; color: var(--md-sys-color-on-surface); font-weight: 500; }
    .item-supporting-text { font-size: 14px; color: var(--ion-color-secondary); }
    .item-end { display: flex; }

    .empty-state {
      text-align: center;
      padding: 32px;
      color: var(--ion-color-medium);
      background: var(--md-sys-color-surface-container);
      border-radius: var(--md-sys-shape-corner-medium);
      border: 1px dashed var(--md-sys-color-outline);
    }
  `]
})
export class FeatureManagerComponent implements OnInit {
  features: Feature[] = [];
  newFeatureName: string = '';
  newFeatureDesc: string = '';
  newFeatureColor: string = '#6750a4';

  editingFeatureId: string | null = null; // State for editing

  predefinedColors = [
    '#6750a4', '#b3261e', '#7d5260', '#625b71',
    '#006C4C', '#8E4E00', '#00639A', '#5D5F5F'
  ];

  constructor(private issueService: IssueService) {
    addIcons({ trash, add, createOutline, close });
  }

  ngOnInit() {
    this.loadFeatures();
  }

  loadFeatures() {
    this.features = this.issueService.getFeatures();
  }

  saveFeature() {
    if (!this.newFeatureName.trim()) return;

    const feature: Feature = {
      id: this.editingFeatureId || Date.now().toString(),
      name: this.newFeatureName.trim(),
      description: this.newFeatureDesc,
      color: this.newFeatureColor
    };

    const success = this.issueService.saveFeature(feature);
    if (success) {
      this.cancelEdit();
      this.loadFeatures();
    }
  }

  editFeature(feature: Feature) {
    this.editingFeatureId = feature.id;
    this.newFeatureName = feature.name;
    this.newFeatureDesc = feature.description || '';
    this.newFeatureColor = feature.color || '#6750a4';
  }

  cancelEdit() {
    this.editingFeatureId = null;
    this.newFeatureName = '';
    this.newFeatureDesc = '';
    this.newFeatureColor = '#6750a4';
  }

  deleteFeature(id: string) {
    this.issueService.deleteFeature(id);
    this.loadFeatures();
    if (this.editingFeatureId === id) {
      this.cancelEdit();
    }
  }
}
