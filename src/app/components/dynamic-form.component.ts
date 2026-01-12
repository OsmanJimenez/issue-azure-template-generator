import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TemplateConfig, TemplateData, VariableConfig } from '../models/template.model';
import { addIcons } from 'ionicons';
import { sparkles } from 'ionicons/icons';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  template: `
    <div class="dynamic-form">
      <div *ngFor="let variable of template.variables" class="field-wrapper">
         <ion-item 
           fill="outline" 
           [class.auto-field]="variable.label?.includes('(Auto)')"
           [class.field-updated]="isFieldUpdated(variable.key)">
            <ion-label position="floating">
              {{ variable.label || variable.key }} 
              <span *ngIf="variable.required" class="text-danger">*</span>
              <ion-icon 
                *ngIf="variable.label?.includes('(Auto)')" 
                name="sparkles" 
                class="auto-icon"
                title="Este campo se llena automáticamente">
              </ion-icon>
            </ion-label>
            
            <ion-input *ngIf="variable.type === 'text'" 
                       [(ngModel)]="formData.values[variable.key]"
                       [placeholder]="variable.placeholder || ''"
                       (ionChange)="emitChange(variable.key)">
            </ion-input>

            <ion-input *ngIf="variable.type === 'url'" 
                       type="url"
                       placeholder="https://..."
                       [(ngModel)]="formData.values[variable.key]"
                       (ionChange)="emitChange(variable.key)">
            </ion-input>

            <ion-textarea *ngIf="variable.type === 'textarea'"
                          [(ngModel)]="formData.values[variable.key]"
                          rows="3"
                          (ionChange)="emitChange(variable.key)">
            </ion-textarea>
            
            <ion-input *ngIf="variable.type === 'date'"
                       type="date"
                       [(ngModel)]="formData.values[variable.key]"
                       (ionChange)="emitChange(variable.key)">
            </ion-input>

            <ion-select *ngIf="variable.type === 'select'"
                        [(ngModel)]="formData.values[variable.key]"
                        (ionChange)="emitChange(variable.key)"
                        interface="popover">
                <ion-select-option *ngFor="let opt of variable.options" [value]="opt">{{ opt }}</ion-select-option>
            </ion-select>
         </ion-item>
      </div>
      
      <div *ngIf="template.variables.length === 0" class="empty-vars">
        <ion-icon name="albums" size="large" color="medium"></ion-icon>
        <p>Este template no tiene variables detectadas ({{ '{' + '{' }}key{{ '}' + '}' }}).</p>
      </div>
    </div>
  `,
  styles: [`
    .dynamic-form { 
      display: flex; 
      flex-direction: column; 
      gap: 16px; 
    }
    
    .field-wrapper { 
      width: 100%;
      position: relative;
    }
    
    .text-danger { 
      color: var(--ion-color-danger); 
      margin-left: 2px;
    }
    
    .empty-vars { 
      padding: 40px 20px; 
      text-align: center; 
      color: var(--ion-color-medium); 
      background: var(--ion-color-light); 
      border-radius: 12px;
      
      ion-icon {
        margin-bottom: 12px;
        opacity: 0.5;
      }
      
      p {
        margin: 0;
        font-size: 14px;
      }
    }
    
    /* Campos auto-completados */
    ion-item.auto-field {
      --background: linear-gradient(135deg, rgba(var(--ion-color-primary-rgb), 0.05) 0%, rgba(var(--ion-color-secondary-rgb), 0.05) 100%);
      border-left: 3px solid var(--ion-color-primary);
      transition: all 0.3s ease;
      
      ion-label {
        font-style: italic;
        color: var(--ion-color-medium-shade);
      }
    }
    
    .auto-icon {
      font-size: 14px;
      color: var(--ion-color-primary);
      margin-left: 4px;
      vertical-align: middle;
      animation: sparkle 2s ease-in-out infinite;
    }
    
    @keyframes sparkle {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.1); }
    }
    
    /* Animación cuando se actualiza un campo */
    .field-updated {
      animation: fieldPulse 0.5s ease;
    }
    
    @keyframes fieldPulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.02); box-shadow: 0 0 0 3px rgba(var(--ion-color-success-rgb), 0.3); }
      100% { transform: scale(1); }
    }
    
    /* Mejoras de accesibilidad */
    ion-item {
      --min-height: 56px;
      --padding-start: 12px;
      --padding-end: 12px;
      transition: all 0.2s ease;
      
      &:hover:not(.auto-field) {
        --background: var(--ion-color-light-tint);
      }
    }
    
    ion-input, ion-textarea, ion-select {
      --padding-top: 12px;
      --padding-bottom: 12px;
    }
  `]
})
export class DynamicFormComponent implements OnChanges {
  @Input() template!: TemplateConfig;
  @Output() dataChange = new EventEmitter<TemplateData>();

  formData: TemplateData = {
    templateId: '',
    values: {}
  };

  private updatedFields = new Set<string>();

  constructor() {
    addIcons({ sparkles });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['template'] && this.template) {
      this.initializeForm();
    }
  }

  initializeForm() {
    this.formData = {
      templateId: this.template.id,
      values: {}
    };

    // Initialize defaults
    this.template.variables.forEach(v => {
      this.formData.values[v.key] = v.defaultValue || '';
    });

    this.updatedFields.clear();
    this.emitChange();
  }

  isFieldUpdated(key: string): boolean {
    return this.updatedFields.has(key);
  }

  emitChange(changedKey?: string) {
    // Smart Parsing Logic for Azure Titles
    if (changedKey === 'full_title') {
      const fullText = this.formData.values['full_title'];
      if (fullText) {
        // Regex to capture "User Story 6691113: Título..."
        const match = fullText.match(/(?:User Story|Feature|Bug)?\s*(\d+)\s*:\s*(.+)/i);
        if (match) {
          this.formData.values['id_user_story'] = match[1];
          this.formData.values['titulo_user_story'] = match[2].trim();

          // Marcar campos como actualizados para animación
          this.updatedFields.add('id_user_story');
          this.updatedFields.add('titulo_user_story');

          // Limpiar después de la animación
          setTimeout(() => {
            this.updatedFields.delete('id_user_story');
            this.updatedFields.delete('titulo_user_story');
          }, 500);
        }
      }
    }

    this.dataChange.emit(this.formData);
  }
}
