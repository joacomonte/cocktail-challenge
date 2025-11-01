import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Cocktail, CocktailSearchResponse, FilteredCocktailSearchResponse, CocktailDetail, CocktailDetailResponse } from '../../shared/models/cocktail';

@Injectable({ providedIn: 'root' })
export class CocktailsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://www.thecocktaildb.com/api/json/v1/1';

  searchByName(name: string): Observable<Cocktail[]> {
    const url = `${this.baseUrl}/search.php?s=${encodeURIComponent(name)}`;
    return this.http.get<CocktailSearchResponse>(url).pipe(
      map((res) => res.drinks ?? []),
      map((drinks) => drinks.map((d) => ({ idDrink: d.idDrink, strDrink: d.strDrink })))
    );
  }

  filterByIngredient(ingredient: string): Observable<Cocktail[]> {
    const url = `${this.baseUrl}/filter.php?i=${encodeURIComponent(ingredient)}`;
    return this.http.get<FilteredCocktailSearchResponse>(url).pipe(
      map((res) => res.drinks ?? []),
      map((drinks) => drinks.map((d) => ({ idDrink: d.idDrink, strDrink: d.strDrink, strDrinkThumb: d.strDrinkThumb })))
    );
  }

  listIngredients(): Observable<string[]> {
    const url = `${this.baseUrl}/list.php?i=list`;
    return this.http.get<{ drinks: Array<{ strIngredient1: string }> | null }>(url).pipe(
      map((res) => (res.drinks ?? []).map((d) => d.strIngredient1))
    );
  }

  lookupById(id: string): Observable<Cocktail[]> {
    const url = `${this.baseUrl}/lookup.php?i=${encodeURIComponent(id)}`;
    return this.http.get<CocktailSearchResponse>(url).pipe(
      map((res) => res.drinks ?? []),
      map((drinks) => drinks.map((d) => ({ idDrink: d.idDrink, strDrink: d.strDrink, strDrinkThumb: d.strDrinkThumb })))
    );
  }

  getDetailsById(id: string): Observable<CocktailDetail | null> {
    const url = `${this.baseUrl}/lookup.php?i=${encodeURIComponent(id)}`;
    return this.http.get<CocktailDetailResponse>(url).pipe(
      map((res) => (res.drinks && res.drinks.length > 0 ? res.drinks[0] : null))
    );
  }
}


