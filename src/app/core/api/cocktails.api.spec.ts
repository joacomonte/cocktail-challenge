import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CocktailsApiService } from './cocktails.api';

describe('CocktailsApiService', () => {
  let service: CocktailsApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CocktailsApiService],
    });
    service = TestBed.inject(CocktailsApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('searchByName maps response to minimal cocktail model', () => {
    const sample = { drinks: [{ idDrink: '1', strDrink: 'X', strDrinkThumb: 't' }] };
    let result: any[] | undefined;
    service.searchByName('margarita').subscribe((res) => (result = res));

    const req = http.expectOne((r) => r.url.includes('/search.php') && r.method === 'GET');
    req.flush(sample);

    expect(result).toBeTruthy();
    expect(result!.length).toBe(1);
    expect(result![0]).toEqual({ idDrink: '1', strDrink: 'X' });
  });

  it('lookupById maps response and keeps thumb when present', () => {
    const sample = { drinks: [{ idDrink: '7', strDrink: 'Negroni', strDrinkThumb: 'thumb-url' }] };
    let result: any[] | undefined;
    service.lookupById('7').subscribe((res) => (result = res));

    const req = http.expectOne((r) => r.url.includes('/lookup.php') && r.method === 'GET');
    req.flush(sample);

    expect(result).toEqual([{ idDrink: '7', strDrink: 'Negroni', strDrinkThumb: 'thumb-url' }]);
  });

  it('returns empty array when API responds with null drinks', () => {
    let result: any[] | undefined;
    service.filterByIngredient('vodka').subscribe((res) => (result = res));

    const req = http.expectOne((r) => r.url.includes('/filter.php') && r.method === 'GET');
    req.flush({ drinks: null });

    expect(result).toEqual([]);
  });

  it('filterByIngredient maps id, name, and thumb', () => {
    let result: any[] | undefined;
    service.filterByIngredient('rum').subscribe((res) => (result = res));

    const req = http.expectOne((r) => r.url.includes('/filter.php') && r.method === 'GET');
    req.flush({ drinks: [{ idDrink: '2', strDrink: 'Cola', strDrinkThumb: 'thumb' }] });

    expect(result).toEqual([{ idDrink: '2', strDrink: 'Cola', strDrinkThumb: 'thumb' }]);
  });

  it('listIngredients maps names from response', () => {
    let result: string[] | undefined;
    service.listIngredients().subscribe((res) => (result = res));

    const req = http.expectOne((r) => r.url.includes('/list.php') && r.method === 'GET');
    req.flush({ drinks: [{ strIngredient1: 'Rum' }, { strIngredient1: 'Lime' }] });

    expect(result).toEqual(['Rum', 'Lime']);
  });

  it('getDetailsById returns null when API returns empty', () => {
    let result: any | undefined;
    service.getDetailsById('999').subscribe((res) => (result = res));

    const req = http.expectOne((r) => r.url.includes('/lookup.php') && r.method === 'GET');
    req.flush({ drinks: [] });

    expect(result).toBeNull();
  });
});


