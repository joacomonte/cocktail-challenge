import { Component, ElementRef, EventEmitter, Output, ViewChild, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CocktailsApiService } from '../../../core/api/cocktails.api';

@Component({
  selector: 'app-ingredient-search',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatAutocompleteModule],
  templateUrl: './ingredient-search.component.html',
  styleUrl: './ingredient-search.component.scss',
})
export class IngredientSearchComponent implements OnInit {
  @Output() readonly search = new EventEmitter<string>();
  @ViewChild('input', { static: true }) input!: ElementRef<HTMLInputElement>;

  readonly MAX_LEN = 50;

  ingredients: string[] = [];
  filtered: string[] = [];

  private readonly storageKey = 'cocktails_ingredient_search_input_v1';
  private inputListener = () => {
    try {
      const v = this.input?.nativeElement?.value ?? '';
      localStorage.setItem(this.storageKey, v);
    } catch {}
  };

  private storageListener = (e: StorageEvent) => {
    if (e.key === this.storageKey && this.input?.nativeElement) {
      const newVal = e.newValue ?? '';
      if (this.input.nativeElement.value !== newVal) this.input.nativeElement.value = newVal;
    }
  };

  private readonly api = inject(CocktailsApiService);

  ngOnInit(): void {
    // fetch list once
    this.api.listIngredients().subscribe((list) => {
      this.ingredients = list || [];
      this.filtered = this.ingredients.slice(0, 50);
    });
    try {
      const raw = localStorage.getItem(this.storageKey) || '';
      if (this.input?.nativeElement) this.input.nativeElement.value = raw;
    } catch {}
    try {
      this.input?.nativeElement?.addEventListener('input', this.inputListener);
      window.addEventListener('storage', this.storageListener);
    } catch {}
  }

  onInput(value: string) {
    const sanitized = (value ?? '').replace(/[^0-9]/g, '');
    if (this.input?.nativeElement) this.input.nativeElement.value = sanitized;
    const q = sanitized.toLowerCase();
    this.filtered = this.ingredients.filter((i) => i.toLowerCase().includes(q)).slice(0, 50);
  }

  onOptionSelected(value: string) {
    this.input.nativeElement.value = value;
    this.search.emit(value);
  }

  clear() {
    this.input.nativeElement.value = '';
    this.filtered = this.ingredients.slice(0, 50);
    try {
      localStorage.removeItem(this.storageKey);
    } catch {}
  }

  onSearch(value?: string) {
    const raw = (value ?? this.input?.nativeElement?.value ?? '') as string;
    const sanitized = raw.replace(/[^0-9]/g, '').slice(0, this.MAX_LEN).trim();
    if (!sanitized) return;
    this.search.emit(sanitized);
  }
}


