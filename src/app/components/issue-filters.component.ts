import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { refresh, settingsOutline } from 'ionicons/icons';
import { TagManagerComponent } from './tag-manager.component';
import { Tag } from '../models/issue.model';

export interface IssueFilters {
  tags: string[];
  dateFrom?: Date;
  dateTo?: Date;
  published?: boolean;
}

@Component({
  selector: 'app-issue-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, TagManagerComponent],
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title>Filtros</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <!-- Filtro por etiquetas -->
        <ion-item>
          <ion-label position="stacked">Etiquetas</ion-label>
          <ion-select 
            multiple="true" 
            [(ngModel)]="filters.tags"
            (ionSelectionChange)="onFiltersChange()"
            placeholder="Seleccionar etiquetas">
            <ion-select-option *ngFor="let tag of availableTags" [value]="tag.id">
              {{tag.name}}
            </ion-select-option>
          </ion-select>
          <ion-button slot="end" fill="clear" (click)="openTagManager()">
            <ion-icon name="settings-outline"></ion-icon>
          </ion-button>
        </ion-item>

        <!-- Filtro por fecha desde -->
        <ion-item button="true" id="open-date-from-modal">
          <ion-label position="stacked">Fecha desde</ion-label>
          <ion-text>{{ dateFromString ? (dateFromString | date:'mediumDate') : 'Seleccionar fecha' }}</ion-text>
        </ion-item>
        <ion-modal trigger="open-date-from-modal" [keepContentsMounted]="true">
          <ng-template>
            <ion-datetime
              [(ngModel)]="dateFromString"
              (ionChange)="onDateFromChange()"
              presentation="date"
              [showDefaultButtons]="true"
              doneText="Aceptar"
              cancelText="Cancelar">
            </ion-datetime>
          </ng-template>
        </ion-modal>

        <!-- Filtro por fecha hasta -->
        <ion-item button="true" id="open-date-to-modal">
          <ion-label position="stacked">Fecha hasta</ion-label>
          <ion-text>{{ dateToString ? (dateToString | date:'mediumDate') : 'Seleccionar fecha' }}</ion-text>
        </ion-item>
        <ion-modal trigger="open-date-to-modal" [keepContentsMounted]="true">
          <ng-template>
            <ion-datetime
              [(ngModel)]="dateToString"
              (ionChange)="onDateToChange()"
              presentation="date"
              [showDefaultButtons]="true"
              doneText="Aceptar"
              cancelText="Cancelar">
            </ion-datetime>
          </ng-template>
        </ion-modal>

        <!-- Filtro por estado de publicación -->
        <ion-item>
          <ion-label>Solo publicados</ion-label>
          <ion-checkbox 
            [(ngModel)]="filters.published"
            (ionChange)="onFiltersChange()">
          </ion-checkbox>
        </ion-item>

        <!-- Botones de acción -->
        <div class="filter-actions">
          <ion-button fill="clear" (click)="clearFilters()">
            <ion-icon name="refresh" slot="start"></ion-icon>
            Limpiar
          </ion-button>
        </div>
      </ion-card-content>
    </ion-card>
  `,
  styles: [`
    .filter-actions {
      margin-top: 16px;
      text-align: center;
    }
  `]
})
export class IssueFiltersComponent {
  @Input() availableTags: Tag[] = [];
  @Output() filtersChange = new EventEmitter<IssueFilters>();
  @Output() tagsUpdated = new EventEmitter<void>();

  constructor(private modalCtrl: ModalController) {
    addIcons({ settingsOutline, refresh });
  }

  async openTagManager() {
    const modal = await this.modalCtrl.create({
      component: TagManagerComponent
    });
    await modal.present();
    await modal.onDidDismiss();
    this.tagsUpdated.emit();
  }

  filters: IssueFilters = {
    tags: [],
    published: undefined
  };

  dateFromString?: string;
  dateToString?: string;

  onFiltersChange(): void {
    this.filtersChange.emit({ ...this.filters });
  }

  onDateFromChange(): void {
    this.filters.dateFrom = this.dateFromString ? new Date(this.dateFromString) : undefined;
    this.onFiltersChange();
  }

  onDateToChange(): void {
    this.filters.dateTo = this.dateToString ? new Date(this.dateToString) : undefined;
    this.onFiltersChange();
  }

  clearFilters(): void {
    this.filters = {
      tags: [],
      published: undefined
    };
    this.dateFromString = undefined;
    this.dateToString = undefined;
    this.onFiltersChange();
  }
}