import { Injectable, effect, signal, computed, inject } from '@angular/core';
import { CocktailsApiService } from '../../../core/api/cocktails.api';
import { Cocktail } from '../../../shared/models/cocktail';

interface CocktailsPersistedState {
  searchTerm: string;
  drinks: Cocktail[];
  page: number;
}

@Injectable({ providedIn: 'root' })
export class CocktailsStore {
  private readonly cocktailsApi = inject(CocktailsApiService);

  private readonly storageKey = 'cocktails_state_v1';
  private readonly defaultSearch = 'margarita';
  private readonly defaultPageSize = 5;

  readonly pageSize = this.defaultPageSize;

  // State
  readonly searchTerm = signal<string>(this.defaultSearch);
  readonly drinks = signal<Cocktail[]>([]);
  readonly loading = signal<boolean>(false);
  readonly page = signal<number>(1);

  // Derived state
  readonly displayedDrinks = computed(() => {
    const end = this.page() * this.defaultPageSize;
    return this.drinks().slice(0, end);
  });

  readonly hasMore = computed(() => this.displayedDrinks().length < this.drinks().length);

  constructor() {
    // Load persisted state if present
    this.restoreFromLocalStorage();

    // Persist state on change
    effect(() => {
      const stateToPersist: CocktailsPersistedState = {
        searchTerm: this.searchTerm(),
        drinks: this.drinks(),
        page: this.page(),
      };
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(stateToPersist));
      } catch {
        // ignore persistence errors
      }
    });

    // Cross-tab sync
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey && e.newValue) {
        try {
          const incoming: CocktailsPersistedState = JSON.parse(e.newValue);
          this.searchTerm.set(incoming.searchTerm ?? this.defaultSearch);
          this.drinks.set(Array.isArray(incoming.drinks) ? incoming.drinks : []);
          this.page.set(typeof incoming.page === 'number' ? incoming.page : 1);
        } catch {
          // ignore corrupt values
        }
      }
    });

    // Initial fetch if no data present
    if (this.drinks().length === 0) {
      this.search(this.searchTerm());
    }
  }

  search(term: string) {
    const normalized = term?.trim() || this.defaultSearch;
    this.searchTerm.set(normalized);
    this.loading.set(true);
    this.page.set(1);
    this.cocktailsApi.searchByName(normalized).subscribe({
      next: (drinks) => {
        this.drinks.set(drinks);
        this.loading.set(false);
      },
      error: () => {
        this.drinks.set([]);
        this.loading.set(false);
      },
    });
  }

  loadMore() {
    if (this.hasMore()) {
      this.page.update((p) => p + 1);
    }
  }

  resetPaging() {
    this.page.set(1);
  }

  private restoreFromLocalStorage() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as CocktailsPersistedState;
      if (parsed.searchTerm) this.searchTerm.set(parsed.searchTerm);
      if (Array.isArray(parsed.drinks)) this.drinks.set(parsed.drinks);
      if (typeof parsed.page === 'number') this.page.set(parsed.page);
    } catch {
      // ignore
    }
  }
}


