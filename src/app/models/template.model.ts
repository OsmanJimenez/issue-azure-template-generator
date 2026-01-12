export type VariableType = 'text' | 'textarea' | 'date' | 'select' | 'url';

export interface VariableConfig {
    key: string;       // The text between braces, e.g. 'description'
    label?: string;    // Auto-generated or user-defined
    type: VariableType;
    options?: string[]; // For select types
    required?: boolean;
    defaultValue?: string;
    placeholder?: string;
}

export interface TemplateConfig {
    id: string;
    name: string;
    description?: string;
    version: number;
    isDefault?: boolean;

    // The full markdown content with {{placeholders}}
    rawContent: string;

    // Configuration for the detected variables
    variables: VariableConfig[];

    createdAt: Date;
    updatedAt: Date;
}

export interface TemplateData {
    templateId: string;
    // Simple map: key -> value
    values: { [key: string]: any };
}
