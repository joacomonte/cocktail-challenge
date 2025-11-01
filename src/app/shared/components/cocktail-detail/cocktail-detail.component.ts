import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CocktailsApiService } from '../../../core/api/cocktails.api';
import { CocktailDetail } from '../../models/cocktail';

@Component({
  selector: 'app-cocktail-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatOptionModule, MatProgressSpinnerModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './cocktail-detail.component.html',
  styleUrl: './cocktail-detail.component.scss',
})
export class CocktailDetailComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<CocktailDetailComponent>);
  private readonly data = inject<{ id: string }>(MAT_DIALOG_DATA);

  loading = false;
  detail: CocktailDetail | null = null;
  selectedLang: 'EN' | 'ES' | 'DE' | 'FR' | 'IT' = 'EN';
  imageLoaded = false;

  private readonly api = inject(CocktailsApiService);

  ngOnInit(): void {
    this.fetch();
  }

  private fetch() {
    const id = this.data?.id?.trim();
    if (!id) {
      this.detail = null;
      return;
    }
    this.loading = true;
    this.imageLoaded = false;
    this.api.getDetailsById(id).subscribe({
      next: (d) => {
        this.detail = d;
        this.loading = false;
      },
      error: () => {
        this.detail = null;
        this.loading = false;
      },
    });
  }

  get ingredients(): Array<{ ingredient: string; measure?: string | null }> {
    const d = this.detail;
    if (!d) return [];
    const result: Array<{ ingredient: string; measure?: string | null }> = [];
    for (let i = 1; i <= 15; i++) {
      const ing = (d as any)[`strIngredient${i}`] as string | null | undefined;
      const mea = (d as any)[`strMeasure${i}`] as string | null | undefined;
      if (ing && ing.trim()) {
        result.push({ ingredient: ing, measure: mea });
      }
    }
    return result;
  }

  get instructions(): string | undefined {
    const d = this.detail;
    if (!d) return undefined;
    switch (this.selectedLang) {
      case 'ES':
        return d.strInstructionsES || d.strInstructions || undefined;
      case 'DE':
        return d.strInstructionsDE || d.strInstructions || undefined;
      case 'FR':
        return d.strInstructionsFR || d.strInstructions || undefined;
      case 'IT':
        return d.strInstructionsIT || d.strInstructions || undefined;
      case 'EN':
      default:
        return d.strInstructions || undefined;
    }
  }

  onImageLoad() {
    this.imageLoaded = true;
  }

  close() {
    this.dialogRef.close();
  }
}


