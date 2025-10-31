import { AfterViewInit, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CocktailsStore } from '../services/cocktails.store';

@Component({
  selector: 'app-cocktails-page',
  standalone: true,
  imports: [MatToolbarModule, MatTableModule, MatProgressSpinnerModule, MatCardModule, MatIconModule],
  templateUrl: './cocktails.page.html',
  styleUrl: './cocktails.page.scss',
})
export class CocktailsPage implements AfterViewInit {
  protected readonly store = inject(CocktailsStore);

  protected readonly displayedColumns = ['idDrink', 'strDrink'] as const;

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('sentinel') private sentinel?: ElementRef<HTMLDivElement>;

  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    const root = this.scrollContainer?.nativeElement ?? null;
    const target = this.sentinel?.nativeElement ?? null;
    if (!root || !target) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          if (!this.store.loading() && this.store.hasMore()) {
            this.store.loadMore();
          }
        }
      },
      { root, threshold: 0.1 }
    );
    this.observer.observe(target);
  }
}


