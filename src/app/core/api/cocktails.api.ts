import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Cocktail, CocktailSearchResponse } from '../../shared/models/cocktail';

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
}


