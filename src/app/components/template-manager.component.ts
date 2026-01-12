import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { TemplateManagerService } from '../services/template-manager.service';
import { TemplateConfig } from '../models/template.model';
import { addIcons } from 'ionicons';
import { add, createOutline, trash, copyOutline, star, starOutline } from 'ionicons/icons';
import { TemplateEditorComponent } from './template-editor.component';

@Component({
  selector: 'app-template-manager',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="manager-container">
      <div class="header">
        <h2>Mis Templates</h2>
        <ion-button (click)="createTemplate()">
          <ion-icon name="add" slot="start"></ion-icon>
          Nuevo Template
        </ion-button>
      </div>

      <div class="template-list">
        <ion-card *ngFor="let template of templates" class="md3-card-elevated">
          <ion-card-content>
            <div class="card-header">
              <h3 class="headline">{{ template.name }}</h3>
              <div class="actions">
                <ion-button fill="clear" (click)="toggleDefault(template)">
                  <ion-icon [name]="template.isDefault ? 'star' : 'star-outline'" [color]="template.isDefault ? 'warning' : 'medium'" slot="icon-only"></ion-icon>
                </ion-button>
                <ion-button fill="clear" (click)="editTemplate(template)">
                  <ion-icon name="create-outline" slot="icon-only"></ion-icon>
                </ion-button>
                <ion-button fill="clear" (click)="cloneTemplate(template)">
                  <ion-icon name="copy-outline" slot="icon-only"></ion-icon>
                </ion-button>
                <ion-button fill="clear" color="danger" (click)="deleteTemplate(template)">
                  <ion-icon name="trash" slot="icon-only"></ion-icon>
                </ion-button>
              </div>
            </div>
            <p class="supporting-text">Versión {{ template.version }} • {{ template.variables.length }} Variables</p>
          </ion-card-content>
        </ion-card>
      </div>
    </div>
  `,
  styles: [`
    .manager-container { padding: 16px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h2 { margin: 0; font-size: 20px; font-weight: 500; color: var(--md-sys-color-on-surface); }
    
    .template-list { display: flex; flex-direction: column; gap: 12px; }
    
    .md3-card-elevated {
      margin: 0;
      background: var(--md-sys-color-surface-container);
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12);
    }
    
    .card-header { display: flex; justify-content: space-between; align-items: center; }
    .headline { margin: 0; font-size: 16px; font-weight: 500; color: var(--md-sys-color-on-surface); }
    .supporting-text { margin: 4px 0 0; font-size: 12px; color: var(--md-sys-color-outline); }
    .actions { display: flex; }
  `]
})
export class TemplateManagerComponent implements OnInit {
  templates: TemplateConfig[] = [];

  constructor(
    private templateService: TemplateManagerService,
    private modalCtrl: ModalController
  ) {
    addIcons({ add, createOutline, trash, copyOutline, star, starOutline });
  }

  ngOnInit() {
    this.loadTemplates();
  }

  loadTemplates() {
    this.templates = this.templateService.getTemplates();
  }

  createTemplate() {
    this.openEditor();
  }

  editTemplate(template: TemplateConfig) {
    this.openEditor(template);
  }

  async openEditor(template?: TemplateConfig) {
    const modal = await this.modalCtrl.create({
      component: TemplateEditorComponent,
      componentProps: {
        templateId: template?.id
      }
    });

    await modal.present();
    await modal.onDidDismiss();
    this.loadTemplates();
  }

  cloneTemplate(template: TemplateConfig) {
    this.templateService.cloneTemplate(template);
    this.loadTemplates();
  }

  deleteTemplate(template: TemplateConfig) {
    // Confirmation could be added here
    this.templateService.deleteTemplate(template.id);
    this.loadTemplates();
  }

  toggleDefault(template: TemplateConfig) {
    this.templateService.setDefault(template.id);
    this.loadTemplates();
  }
}
