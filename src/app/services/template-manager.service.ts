import { Injectable } from '@angular/core';
import { TemplateConfig, TemplateData, VariableConfig } from '../models/template.model';

@Injectable({
    providedIn: 'root'
})
export class TemplateManagerService {
    private readonly STORAGE_KEY = 'azure_issue_templates_v3'; // v3: full_title obligatorio
    private templates: TemplateConfig[] = [];

    constructor() {
        this.loadTemplates();
        if (this.templates.length === 0) {
            this.seedDefaults();
        }
    }

    // --- CRUD Operations ---

    getTemplates(): TemplateConfig[] {
        return [...this.templates];
    }

    getTemplateById(id: string): TemplateConfig | undefined {
        return this.templates.find(t => t.id === id);
    }

    saveTemplate(template: TemplateConfig): void {
        const existingIndex = this.templates.findIndex(t => t.id === template.id);
        template.updatedAt = new Date();

        // Auto-detect variables before saving to ensure sync? 
        // Or assume Editor did it. Let's strictly save what is passed.

        if (existingIndex >= 0) {
            this.templates[existingIndex] = template;
        } else {
            template.createdAt = new Date();
            this.templates.push(template);
        }

        this.persist();
    }

    deleteTemplate(id: string): void {
        this.templates = this.templates.filter(t => t.id !== id);
        this.persist();
    }

    cloneTemplate(original: TemplateConfig): TemplateConfig {
        const clone = JSON.parse(JSON.stringify(original));
        clone.id = Date.now().toString();
        clone.name = `${original.name} (Copia)`;
        clone.isDefault = false;
        clone.createdAt = new Date();
        clone.updatedAt = new Date();
        return clone;
    }

    setDefault(id: string): void {
        this.templates.forEach(t => t.isDefault = (t.id === id));
        this.persist();
    }

    // --- Logic ---

    detectVariables(content: string): string[] {
        const regex = /{{([a-zA-Z0-9_\-]+)}}/g;
        const matches = new Set<string>();
        let match;
        while ((match = regex.exec(content)) !== null) {
            matches.add(match[1]);
        }
        return Array.from(matches);
    }

    syncVariables(template: TemplateConfig): void {
        const detectedKeys = this.detectVariables(template.rawContent);

        // Remove variables that no longer exist
        template.variables = template.variables.filter(v => detectedKeys.includes(v.key));

        // Add new variables
        detectedKeys.forEach(key => {
            if (!template.variables.find(v => v.key === key)) {
                template.variables.push({
                    key: key,
                    label: this.humanizeLabel(key),
                    type: 'text', // default
                    required: true
                });
            }
        });

        // Optional: Sort variables by appearance in text?
        // For now we just keep them.
    }

    renderMarkdown(template: TemplateConfig, data: TemplateData): string {
        let result = template.rawContent;

        // Replace all variables
        template.variables.forEach(variable => {
            const val = data.values[variable.key] || '';
            // Global replace per key
            result = result.replace(new RegExp(`{{${variable.key}}}`, 'g'), val);
        });

        return result;
    }

    private humanizeLabel(key: string): string {
        // simple "user_story_id" -> "User Story Id"
        return key
            .replace(/_/g, ' ')
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    // --- Persistence ---

    private persist() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.templates));
    }

    private loadTemplates() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try {
                this.templates = JSON.parse(saved);
                // Date handling if needed
            } catch (e) {
                console.error('Error loading templates', e);
            }
        }
    }

    // --- Seeds ---
    private seedDefaults() {
        const nequiHU: TemplateConfig = {
            id: 'nequi-hu-simple',
            name: 'HU Nequi (Ejemplo Completo)',
            version: 1,
            isDefault: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            rawContent: `## Descripción
{{descripcion_requerimiento}}

## Historias de Usuario
📋 [User Story {{id_user_story}}](https://dev.azure.com/GrupoBancolombia/Nequi/_workitems/edit/{{id_user_story}}): {{titulo_user_story}}

## Pull Requests

### **Feature Front**
> Feature Branch: {{feature_branch}}
> - Dev: {{link_dev_front}}
> - QA: {{link_qa_front}}
> - Stage: {{link_stage_front}}

### **Adapters**
> Feature Branch: {{feature_branch}}
> - Dev: {{link_dev_adapters}}
> - QA: {{link_qa_adapters}}
> - Stage: {{link_stage_adapters}}

### **Firebase**

#### Descripción
{{descripcion_firebase}}

----

{{parametro_key}}

<table>
    <tr>
        <th>Parameter name (key)</th>
        <td>{{parametro_key}}</td>
    </tr>
    <tr>
        <th>Description</th>
        <td>{{parametro_descripcion}}</td>
    </tr>
    <tr>
        <th>Type</th>
        <td>JSON</td>
    </tr>
    <tr>
        <th>Default value</th>
        <td>{{valor_defecto}}</td>
    </tr>
    <tr>
        <th>Associated screen</th>
        <td>
            <a href="{{link_figma}}">ir al Figma</a>
        </td>
    </tr>
</table>

Jira
---`,
            variables: [
                { key: 'full_title', label: 'Título Completo de Azure', type: 'text', placeholder: 'User Story 6691113: Implementar validación...', required: true },
                { key: 'descripcion_requerimiento', label: 'Descripción Requerimiento', type: 'textarea' },
                { key: 'id_user_story', label: 'ID User Story (Auto)', type: 'text' },
                { key: 'titulo_user_story', label: 'Título US (Auto)', type: 'text' },
                { key: 'feature_branch', label: 'Nombre Rama Feature', type: 'text' },
                { key: 'link_dev_front', label: 'PR Dev (Front)', type: 'url' },
                { key: 'link_qa_front', label: 'PR QA (Front)', type: 'url' },
                { key: 'link_stage_front', label: 'PR Stage (Front)', type: 'url' },
                { key: 'link_dev_adapters', label: 'PR Dev (Adapters)', type: 'url' },
                { key: 'link_qa_adapters', label: 'PR QA (Adapters)', type: 'url' },
                { key: 'link_stage_adapters', label: 'PR Stage (Adapters)', type: 'url' },
                { key: 'descripcion_firebase', label: 'Desc. Firebase', type: 'textarea' },
                { key: 'parametro_key', label: 'Key Remote Config', type: 'text' },
                { key: 'parametro_descripcion', label: 'Desc. Parámetro', type: 'text' },
                { key: 'valor_defecto', label: 'JSON Valor Defecto', type: 'textarea' },
                { key: 'link_figma', label: 'Link Figma', type: 'url' }
            ]
        };

        this.templates.push(nequiHU);
        this.persist();
    }
}
