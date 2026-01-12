import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonTextarea, IonButton, IonCard, IonCardContent, IonIcon, ModalController, IonSelect, IonSelectOption, IonSegment, IonSegmentButton, IonFabButton, IonAccordion, IonAccordionGroup, IonFooter, AlertController } from '@ionic/angular/standalone';
import { TagManagerComponent } from '../components/tag-manager.component';
import { FeatureManagerComponent } from '../components/feature-manager.component';
import { TemplateManagerComponent } from '../components/template-manager.component';
import { DynamicFormComponent } from '../components/dynamic-form.component';
import { TemplateGeneratorService } from '../services/template-generator.service';
import { TemplateManagerService } from '../services/template-manager.service';
import { IssueService } from '../services/issue.service';
import { Issue, Tag, Feature } from '../models/issue.model';
import { TemplateConfig, TemplateData } from '../models/template.model';
import type { IssueFilters } from '../components/issue-filters.component';
import { addIcons } from 'ionicons';
import { add, create, trash, eye, time, settingsOutline, refresh, star, pricetag, albums, arrowBack, copyOutline, save, close, createOutline, alertCircle, addCircle } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonTextarea, IonButton, IonCard, IonCardContent, IonIcon, IonSelect, IonSelectOption, IonSegment, IonSegmentButton, IonFabButton, IonAccordion, IonAccordionGroup, IonFooter, TagManagerComponent, FeatureManagerComponent, TemplateManagerComponent, DynamicFormComponent],
})
export class HomePage {
  currentView: 'issues' | 'tags' | 'features' | 'templates' = 'issues';

  // Issue Form Data (Legacy)
  userStory = '';
  year = '';
  sp = '';
  description = '';
  selectedTags: string[] = [];
  selectedFeatures: string[] = [];

  // Dynamic Template Data
  templates: TemplateConfig[] = [];
  selectedTemplateId: string = ''; // Default to empty to force selection
  currentTemplateConfig: TemplateConfig | undefined;
  dynamicData: TemplateData | null = null;

  generatedTemplate = '';
  errorMessage = '';

  issues: Issue[] = [];
  filteredIssues: Issue[] = [];

  availableTags: Tag[] = [];
  availableFeatures: Feature[] = [];

  currentFilters: IssueFilters = { tags: [] };
  editingIssue: Issue | null = null;
  showIssuesList = true;
  showHistory = false;
  selectedIssueId = '';

  constructor(
    private templateGenerator: TemplateGeneratorService, // Old logic
    private templateManager: TemplateManagerService,    // New logic
    private issueService: IssueService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) {
    addIcons({ add, create, trash, eye, time, settingsOutline, refresh, star, pricetag, albums, arrowBack, copyOutline, save, close, createOutline, alertCircle, addCircle });
  }

  ionViewWillEnter() {
    this.loadIssues();
    this.refreshTemplates();
  }

  refreshTemplates() {
    this.templates = this.templateManager.getTemplates();
  }

  onTemplateSelectChange() {
    if (this.selectedTemplateId && this.selectedTemplateId !== 'legacy') {
      this.currentTemplateConfig = this.templateManager.getTemplateById(this.selectedTemplateId);
    } else {
      this.currentTemplateConfig = undefined;
    }
    // Clear generated template when switching types to avoid confusion
    this.generatedTemplate = '';
  }

  onDynamicDataChange(data: TemplateData) {
    this.dynamicData = data;
  }

  async generateTemplate() {
    if (this.generatedTemplate) {
      const alert = await this.alertCtrl.create({
        header: '¿Regenerar Template?',
        message: 'Se perderán los cambios manuales que hayas hecho en el template actual. ¿Deseas continuar?',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          { text: 'Sí, regenerar', handler: () => this.executeGeneration() }
        ]
      });
      await alert.present();
    } else {
      this.executeGeneration();
    }
  }

  executeGeneration() {
    this.errorMessage = '';
    this.generatedTemplate = '';

    try {
      if (this.selectedTemplateId === 'legacy' || !this.currentTemplateConfig) {
        // Legacy Generation
        const parsed = this.templateGenerator.parseUserStory({
          userStory: this.userStory,
          year: this.year,
          sp: this.sp,
          description: this.description
        });
        this.generatedTemplate = this.templateGenerator.generateTemplate(parsed);
      } else {
        // Dynamic Generation
        if (this.dynamicData) {
          this.generatedTemplate = this.templateManager.renderMarkdown(this.currentTemplateConfig, this.dynamicData);
        } else {
          this.errorMessage = "Faltan datos para generar el template.";
        }
      }
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }

  saveIssue() {
    if (!this.generatedTemplate) {
      this.errorMessage = 'Primero genera el template';
      return;
    }

    const issueData: any = {
      template: this.generatedTemplate,
      tags: this.selectedTags,
      features: this.selectedFeatures
    };

    // Store metadata based on mode
    if (this.selectedTemplateId === 'legacy') {
      issueData.userStory = this.userStory;
      issueData.year = this.year;
      issueData.sp = this.sp;
      issueData.description = this.description;
    } else {
      // For dynamic, we might want to map some fields to the Issue summary card, 
      // but for now we fallback to generic titling or try to find a 'userStory' field.
      issueData.userStory = this.currentTemplateConfig?.name + ' (Dinámico)';
      // Try to find a field named 'userStory' or 'title' in dynamic data?
      // Simplified: Just use template name or generic.
    }

    // Always attach timestamp
    if (!issueData.createdAt) issueData.createdAt = new Date();

    if (this.editingIssue) {
      this.issueService.updateIssue(this.editingIssue.id, issueData);
      this.editingIssue = null;
    } else {
      this.issueService.saveIssue(issueData);
    }

    this.loadIssues();
    this.clear();
    this.showIssuesList = true;
  }

  editIssue(issue: Issue) {
    this.editingIssue = issue;
    this.selectedTemplateId = 'legacy'; // Default to legacy for now as we don't store which dynamic template was used yet
    // Load Legacy Data
    this.userStory = issue.userStory;
    this.year = issue.year || '';
    this.sp = issue.sp || '';
    this.description = issue.description || '';

    this.selectedTags = [...issue.tags];
    this.selectedFeatures = issue.features ? [...issue.features] : [];
    this.generatedTemplate = issue.template;
    this.showIssuesList = false;
  }

  deleteIssue(id: string) {
    this.issueService.deleteIssue(id);
    this.loadIssues();
  }

  publishIssue(id: string) {
    this.issueService.updateIssue(id, { publishedAt: new Date() });
    this.loadIssues();
  }

  loadIssues() {
    this.issues = this.issueService.getIssues();
    this.availableTags = this.issueService.getAllTags();
    this.availableFeatures = this.issueService.getFeatures();
    this.applyFilters();
  }

  applyFilters() {
    this.filteredIssues = this.issueService.filterIssues(this.currentFilters);
  }

  onFiltersChange(filters: IssueFilters) {
    this.currentFilters = filters;
    this.applyFilters();
  }

  newIssue() {
    this.clear();
    this.showIssuesList = false;
  }

  backToList() {
    this.clear();
    this.showIssuesList = true;
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.generatedTemplate);
  }

  clear() {
    this.selectedTemplateId = 'legacy';
    this.currentTemplateConfig = undefined;
    this.userStory = '';
    this.year = '';
    this.sp = '';
    this.description = '';
    this.generatedTemplate = '';
    this.errorMessage = '';
    this.selectedTags = [];
    this.selectedFeatures = [];
    this.editingIssue = null;
    this.dynamicData = null;
  }

  getTagById(id: string): Tag | undefined {
    return this.availableTags.find((t: Tag) => t.id === id);
  }

  getFeatureById(id: string): Feature | undefined {
    return this.availableFeatures.find((f: Feature) => f.id === id);
  }
}
