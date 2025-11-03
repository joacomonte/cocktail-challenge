import { Component, ElementRef, ViewChild, inject} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { CocktailsStore } from '../services/cocktails.store';
import { SearchComponent } from '../../../shared/components/drink-search/search.component';
import { IngredientSearchComponent } from '../../../shared/components/ingredient-search/ingredient-search.component';
import { IdSearchComponent } from '../../../shared/components/id-search/id-search.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CocktailDetailComponent } from '../../../shared/components/cocktail-detail/cocktail-detail.component';

@Component({
  selector: 'app-cocktails-page',
  standalone: true,
  imports: [MatToolbarModule, MatTableModule, MatProgressSpinnerModule, MatCardModule, MatIconModule, MatButtonModule, MatMenuModule, SearchComponent, IngredientSearchComponent, IdSearchComponent, MatSlideToggleModule],
  templateUrl: './cocktails.page.html',
  styleUrl: './cocktails.page.scss',
})
export class CocktailsPage {
  public readonly store = inject(CocktailsStore);
  
  private readonly dialog = inject(MatDialog);

  public readonly displayedColumns = ['actions', 'idDrink', 'strDrink'] as const;

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLDivElement>;
  @ViewChild(SearchComponent) private nameSearchComp?: SearchComponent;
  @ViewChild(IngredientSearchComponent) private ingredientSearchComp?: IngredientSearchComponent;
  @ViewChild(IdSearchComponent) private idSearchComp?: IdSearchComponent;

  private scrollLock = false;
  private readonly scrollStorageKey = 'cocktails_scroll_top_v1';
  private storageListener = (e: StorageEvent) => {
    if (e.key === this.scrollStorageKey) {
      const v = Number(e.newValue ?? 0);
      try {
        if (this.scrollContainer?.nativeElement) this.scrollContainer.nativeElement.scrollTop = v;
      } catch {}
    }
  };

  ngAfterViewInit(): void {
    // restore last-known scroll position
    try {
      const raw = localStorage.getItem(this.scrollStorageKey);
      const pos = Number(raw ?? 0) || 0;
      if (this.scrollContainer?.nativeElement && pos > 0) {
        // small timeout to ensure content rendered
        setTimeout(() => (this.scrollContainer!.nativeElement.scrollTop = pos), 0);
      }
    } catch {}

    window.addEventListener('storage', this.storageListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('storage', this.storageListener);
  }

  public seeDetails(row: any) {
    const id = row?.idDrink as string | undefined;
    if (!id) return;
    this.dialog.open(CocktailDetailComponent, {
      width: '95vw',
      maxWidth: '900px',
      maxHeight: '90vh',
      data: { id },
      panelClass: 'cocktail-detail-dialog',
    });
  }

  public onSearchByName(term?: string) {
    this.store.search(term ?? '');
    try {
      this.ingredientSearchComp?.clear();
      this.idSearchComp?.clear();
    } catch {
      console.error('Error clearing ingredient search');
    }
  }

  public onSearchByIngredient(term?: string) {
    this.store.searchByIngredient(term ?? '');
    try {
      this.nameSearchComp?.clear();
      this.idSearchComp?.clear();
    } catch {
      console.error('Error clearing name search');
    }
  }

  public onSearchById(term?: string) {
    this.store.searchById(term ?? '');
    try {
      this.nameSearchComp?.clear();
      this.ingredientSearchComp?.clear();
    } catch {
      console.error('Error clearing id search');
    }
  }


  onScroll(event: Event) {
    const el = event.target as HTMLElement;
    // persist scroll position
    try {
      localStorage.setItem(this.scrollStorageKey, String(el.scrollTop || 0));
    } catch {
      console.error('Error persisting scroll position to localStorage');
    }
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 48;
    if (nearBottom && this.store.hasMore() && !this.scrollLock && !this.store.loading()) {
      this.scrollLock = true;
      this.store.loadMore();
      setTimeout(() => (this.scrollLock = false), 250);
    }
  }
}


