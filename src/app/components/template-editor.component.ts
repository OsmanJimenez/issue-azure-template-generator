import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { TemplateManagerService } from '../services/template-manager.service';
import { TemplateConfig, VariableConfig } from '../models/template.model';
import { addIcons } from 'ionicons';
import { close, save, refresh, trash } from 'ionicons/icons';

@Component({
  selector: 'app-template-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ template.id ? 'Editar Template' : 'Nuevo Template' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="closeModal()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      
      <!-- Basics -->
      <div class="row mb-4">
        <ion-item fill="outline" class="half">
          <ion-label position="floating">Nombre</ion-label>
          <ion-input [(ngModel)]="template.name"></ion-input>
        </ion-item>
        <ion-item fill="outline" class="half">
          <ion-label position="floating">Versión</ion-label>
          <ion-input type="number" [(ngModel)]="template.version"></ion-input>
        </ion-item>
      </div>

      <!-- Raw Content Editor -->
      <div class="editor-section">
        <div class="section-header">
           <ion-label>Contenido del Template</ion-label>
           <ion-note color="medium" class="fs-12">Usa {{ '{' + '{' }}variable{{ '}' + '}' }} para crear campos dinámicos.</ion-note>
        </div>
        <ion-textarea 
          [(ngModel)]="template.rawContent" 
          rows="15" 
          fill="outline" 
          class="code-font"
          [placeholder]="examplePlaceholder"
          (ionBlur)="syncVariables()">
        </ion-textarea>
        
        <div class="actions-bar">
          <ion-button fill="outline" size="small" (click)="syncVariables()">
            <ion-icon name="refresh" slot="start"></ion-icon>
            Detectar Variables
          </ion-button>
        </div>
      </div>

      <!-- Variables Config -->
      <div class="variables-section" *ngIf="template.variables.length > 0">
        <h3>Variables Detectadas ({{ template.variables.length }})</h3>
        
        <div class="variable-list">
          <div *ngFor="let v of template.variables" class="variable-card">
            <div class="var-header">
              <span class="var-key">{{ '{' + '{' + v.key + '}' + '}' }}</span>
            </div>
            
            <div class="var-config row">
               <ion-item fill="outline" class="flex-2">
                 <ion-label position="floating">Etiqueta (Label)</ion-label>
                 <ion-input [(ngModel)]="v.label"></ion-input>
               </ion-item>
               
               <ion-item fill="outline" class="flex-1">
                 <ion-label position="floating">Tipo</ion-label>
                 <ion-select [(ngModel)]="v.type" interface="popover">
                   <ion-select-option value="text">Texto</ion-select-option>
                   <ion-select-option value="textarea">Párrafo</ion-select-option>
                   <ion-select-option value="date">Fecha</ion-select-option>
                   <ion-select-option value="select">Lista</ion-select-option>
                 </ion-select>
               </ion-item>
            </div>
            
            <div class="var-options" *ngIf="v.type === 'select'">
               <ion-item fill="outline">
                 <ion-label position="floating">Opciones (separadas por coma)</ion-label>
                 <ion-input [value]="v.options?.join(', ')" (ionChange)="updateOptions(v, $event)"></ion-input>
               </ion-item>
            </div>

          </div>
        </div>
      </div>

    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-button expand="block" (click)="saveTemplate()" class="ion-margin">
          <ion-icon name="save" slot="start"></ion-icon>
          Guardar Template
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: [`
    .mb-4 { margin-bottom: 16px; }
    .row { display: flex; gap: 8px; align-items: flex-start; }
    .half { flex: 1; }
    .flex-1 { flex: 1; }
    .flex-2 { flex: 2; }
    
    .editor-section { margin-bottom: 24px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .fs-12 { font-size: 12px; }
    .code-font { font-family: monospace; font-size: 13px; --padding-start: 12px; --padding-end: 12px; }
    
    .actions-bar { display: flex; justify-content: flex-end; margin-top: 8px; }

    .variables-section h3 { font-size: 16px; margin-bottom: 12px; color: var(--ion-color-dark); }
    .variable-list { display: flex; flex-direction: column; gap: 12px; }
    
    .variable-card {
      padding: 12px;
      border: 1px solid var(--ion-color-light-shade);
      border-radius: 8px;
      background: var(--ion-color-light-tint);
    }
    
    .var-header { margin-bottom: 8px; }
    .var-key { font-family: monospace; font-weight: 600; color: var(--ion-color-primary); background: rgba(var(--ion-color-primary-rgb), 0.1); padding: 2px 6px; border-radius: 4px; }
    
    .var-config ion-item { --min-height: 48px; }
  `]
})
export class TemplateEditorComponent implements OnInit {
  @Input() templateId?: string;

  template: TemplateConfig = {
    id: '',
    name: 'Nuevo Template',
    version: 1,
    rawContent: '## Título\n{{variable}}',
    variables: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  readonly examplePlaceholder = 'Ej: ## Descripción\n{{descripcion}}\n...';

  constructor(
    private templateService: TemplateManagerService,
    private modalCtrl: ModalController
  ) {
    addIcons({ close, save, refresh, trash });
  }

  ngOnInit() {
    if (this.templateId) {
      const existing = this.templateService.getTemplateById(this.templateId);
      if (existing) {
        this.template = JSON.parse(JSON.stringify(existing));
      }
    } else {
      this.template.id = Date.now().toString();
      this.syncVariables(); // Detect initial
    }
  }

  syncVariables() {
    this.templateService.syncVariables(this.template);
  }

  updateOptions(v: VariableConfig, event: any) {
    const val = event.detail.value;
    if (val) {
      v.options = val.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
    } else {
      v.options = [];
    }
  }

  saveTemplate() {
    this.templateService.saveTemplate(this.template);
    this.closeModal();
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }
}
