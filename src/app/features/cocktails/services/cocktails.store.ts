import { Injectable, effect, signal, computed, inject } from '@angular/core';
import { CocktailsApiService } from '../../../core/api/cocktails.api';
import { Cocktail } from '../../../shared/models/cocktail';

interface CocktailsPersistedState {
  searchTerm: string;
  drinks: Cocktail[];
  page: number;
  favorites: string[];
  displayFavored: boolean;
}

@Injectable({ providedIn: 'root' })
export class CocktailsStore {
  private readonly cocktailsApi = inject(CocktailsApiService);

  private readonly storageKey = 'cocktails_state_v1';
  private readonly defaultSearch = 'margarita';
  private readonly defaultPageSize = 10;

  readonly pageSize = this.defaultPageSize;

  // State
  readonly searchTerm = signal<string>(this.defaultSearch);
  readonly drinks = signal<Cocktail[]>([]);
  readonly loading = signal<boolean>(false);
  readonly page = signal<number>(1);
  readonly favorites = signal<string[]>([]);
  readonly displayFavored = signal<boolean>(false);

  // Derived state
  readonly displayedDrinks = computed(() => {
    const favoritesSet = new Set(this.favorites());
    const source = this.displayFavored()
      ? this.drinks().filter((d) => favoritesSet.has(d.idDrink))
      : this.drinks();
    const end = this.page() * this.defaultPageSize;
    return source.slice(0, end);
  });

  readonly hasMore = computed(() => {
    const favoritesSet = new Set(this.favorites());
    const source = this.displayFavored()
      ? this.drinks().filter((d) => favoritesSet.has(d.idDrink))
      : this.drinks();
    return this.displayedDrinks().length < source.length;
  });

  constructor() {
    this.restoreFromLocalStorage();

    effect(() => {
      const stateToPersist: CocktailsPersistedState = {
        searchTerm: this.searchTerm(),
        drinks: this.drinks(),
        page: this.page(),
        favorites: this.favorites(),
        displayFavored: this.displayFavored(),
      };
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(stateToPersist));
      } catch {
        console.error('Error persisting state to localStorage');
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
          this.favorites.set(Array.isArray(incoming.favorites) ? incoming.favorites : []);
          this.displayFavored.set(Boolean(incoming.displayFavored));
        } catch {
          console.error('Error parsing state from localStorage');
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
    this.resetPaging();
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

  searchByIngredient(ingredient: string) {
    const normalized = ingredient?.trim();
    if (!normalized) return;
    this.searchTerm.set(normalized);
    this.loading.set(true);
    this.resetPaging();
    this.cocktailsApi.filterByIngredient(normalized).subscribe({
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

  searchById(id: string) {
    const normalized = (id ?? '').replace(/[^0-9]/g, '').trim();
    if (!normalized) return;
    this.searchTerm.set(normalized);
    this.loading.set(true);
    this.resetPaging();
    this.cocktailsApi.lookupById(normalized).subscribe({
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
      if (Array.isArray(parsed.favorites)) this.favorites.set(parsed.favorites);
      if (typeof parsed.displayFavored === 'boolean') this.displayFavored.set(parsed.displayFavored);
    } catch {
      console.error('Error restoring state from localStorage');
    }
  }

  // Favorites API
  isFavorited(id: string | undefined | null): boolean {
    if (!id) return false;
    return this.favorites().includes(id);
  }

  toggleFavorite(id: string | undefined | null) {
    if (!id) return;
    const current = this.favorites();
    const idx = current.indexOf(id);
    const next = idx >= 0 ? current.filter((x) => x !== id) : [...current, id];
    this.favorites.set(next);
  }

  // Filter UI API
  toggleDisplayFavored() {
    this.displayFavored.update((v) => !v);
    // reset paging to start when toggling filter for predictable UX
    this.page.set(1);
  }
}


