import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { IssueService } from '../services/issue.service';
import { Tag } from '../models/issue.model';
import { addIcons } from 'ionicons';
import { trash, add, pricetag, createOutline, close } from 'ionicons/icons';

@Component({
  selector: 'app-tag-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  template: `
    <div class="manager-container">
      <div class="md3-form-card" [class.editing]="editingTagId">
         <div class="card-header">
           <h3 class="section-title">{{ editingTagId ? 'Editar Etiqueta' : 'Crear Etiqueta' }}</h3>
           <ion-button *ngIf="editingTagId" fill="clear" size="small" (click)="cancelEdit()">
             <ion-icon name="close" slot="icon-only"></ion-icon>
           </ion-button>
        </div>
        
        <div class="input-group">
          <ion-label>Nombre</ion-label>
          <ion-input [(ngModel)]="newTagName" placeholder="Ej: Backend" (keyup.enter)="saveTag()" fill="outline"></ion-input>
        </div>

        <div class="input-group">
          <ion-label>Color</ion-label>
          <div class="color-picker">
            <div 
              *ngFor="let color of predefinedColors" 
              class="color-circle" 
              [style.background]="color"
              [class.selected]="newTagColor === color"
              (click)="newTagColor = color">
               <span *ngIf="newTagColor === color" class="checkmark">✓</span>
            </div>
          </div>
        </div>

        <ion-button expand="block" (click)="saveTag()" [disabled]="!newTagName" class="add-btn">
          <ion-icon [name]="editingTagId ? 'create-outline' : 'add'" slot="start"></ion-icon>
          {{ editingTagId ? 'Actualizar Etiqueta' : 'Agregar Etiqueta' }}
        </ion-button>
      </div>

      <div class="list-section">
        <h3 class="section-title">Etiquetas Disponibles ({{tags.length}})</h3>
        
        <div class="md3-list">
          <div *ngFor="let tag of tags" class="md3-list-item">
            <div class="item-start">
              <div class="color-indicator" [style.background]="tag.color"></div>
            </div>
            <div class="item-content">
              <div class="item-headline">{{ tag.name }}</div>
            </div>
            <div class="item-end">
              <ion-button fill="clear" (click)="editTag(tag)">
                <ion-icon name="create-outline" slot="icon-only"></ion-icon>
              </ion-button>
              <ion-button fill="clear" color="danger" (click)="deleteTag(tag.id)">
                <ion-icon name="trash" slot="icon-only"></ion-icon>
              </ion-button>
            </div>
          </div>
          
          <div *ngIf="tags.length === 0" class="empty-state">
            <p>No hay etiquetas creadas aún.</p>
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
      border: 1px solid transparent;
      transition: border 0.3s;
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
    
    .checkmark { color: white; text-shadow: 0 0 2px black; font-weight: bold; }

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
export class TagManagerComponent implements OnInit {
  tags: Tag[] = [];
  newTagName: string = '';
  newTagColor: string = '#6750a4';

  editingTagId: string | null = null;

  predefinedColors = [
    '#6750a4', '#b3261e', '#7d5260', '#625b71',
    '#006C4C', '#8E4E00', '#00639A', '#5D5F5F'
  ];

  constructor(
    private issueService: IssueService
  ) {
    addIcons({ trash, add, pricetag, createOutline, close });
  }

  ngOnInit() {
    this.loadTags();
  }

  loadTags() {
    this.tags = this.issueService.getAllTags();
  }

  saveTag() {
    if (!this.newTagName.trim()) return;

    const tag: Tag = {
      id: this.editingTagId || Date.now().toString(),
      name: this.newTagName.trim(),
      color: this.newTagColor
    };

    const success = this.issueService.saveTag(tag);
    if (success) {
      this.cancelEdit();
      this.loadTags();
    }
  }

  editTag(tag: Tag) {
    this.editingTagId = tag.id;
    this.newTagName = tag.name;
    this.newTagColor = tag.color;
  }

  cancelEdit() {
    this.editingTagId = null;
    this.newTagName = '';
    this.newTagColor = '#6750a4';
  }

  deleteTag(id: string) {
    this.issueService.deleteTag(id);
    this.loadTags();
    if (this.editingTagId === id) {
      this.cancelEdit();
    }
  }
}
