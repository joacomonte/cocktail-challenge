export interface Cocktail {
  idDrink: string;
  strDrink: string;
}

export interface CocktailSearchResponse {
  drinks: Cocktail[] | null;
}


