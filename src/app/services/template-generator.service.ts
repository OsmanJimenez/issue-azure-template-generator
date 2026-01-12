import { Injectable } from '@angular/core';

export interface TemplateInput {
  userStory: string;
  year?: string;
  sp?: string;
  description?: string;
}

export interface ParsedData {
  id: string;
  title: string;
  year: string;
  sp: string;
  branchBase: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class TemplateGeneratorService {

  parseUserStory(input: TemplateInput): ParsedData {
    const regex = /User Story\s+(\d+):\s*(.+)/i;
    const match = input.userStory.match(regex);

    if (!match) {
      throw new Error('Formato inválido. Use: User Story <ID>: <TÍTULO>');
    }

    const id = match[1];
    const title = match[2].trim();
    const year = input.year || '';
    const sp = input.sp || '';

    let branchBase = '';
    if (year && sp) {
      branchBase = `${year}/${sp}/master/feature/hu-${id}`;
    }

    const description = input.description || 
      'Como usuario del producto ______ quiero ______ para ______';

    return { id, title, year, sp, branchBase, description };
  }

  generateTemplate(data: ParsedData): string {
    return `## Descripción
${data.description}

## Historias de Usuario
📋 [User Story ${data.id}](https://dev.azure.com/GrupoBancolombia/Nequi/_workitems/edit/${data.id}): ${data.title}

## Pull Requests

### **CO_MobileApp_Front**
> Feature Branch: ${data.branchBase}
> - Dev: 
> - QA: 
> - Stage: 

### **Adapters_MFP**
> Feature Branch: ${data.branchBase}
> - Dev: 
> - QA: 
> - Stage: 

### **MFPF8**
> Feature Branch: ${data.branchBase}
> - Dev: 
> - QA: 
> - Stage: 

### **Devsecops_adapters_mfp_pipeline**
> - Main: 

### **Firebase**

## **Descripción**

## **Parametro**

---

## **PR Antiguos**

### **CO_MobileApp_Front**
> Feature Branch: ${data.branchBase}
> - Dev: 
> - QA: 
> - Stage:`;
  }
}
