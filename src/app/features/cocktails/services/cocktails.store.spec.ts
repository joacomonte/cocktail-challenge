import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CocktailsStore } from './cocktails.store';
import { CocktailsApiService } from '../../../core/api/cocktails.api';

describe('CocktailsStore', () => {
  let store: CocktailsStore;
  let apiMock: jasmine.SpyObj<CocktailsApiService>;

  beforeEach(() => {
    apiMock = jasmine.createSpyObj<CocktailsApiService>('CocktailsApiService', [
      'searchByName',
      'filterByIngredient',
      'lookupById',
    ]);

    TestBed.configureTestingModule({
      providers: [
        CocktailsStore,
        { provide: CocktailsApiService, useValue: apiMock },
      ],
    });

    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(localStorage, 'setItem').and.stub();
    apiMock.searchByName.and.returnValue(of([])); // for constructor initial fetch
    store = TestBed.inject(CocktailsStore);
  });

  it('search() updates searchTerm, loading and drinks on success', () => {
    apiMock.searchByName.and.returnValue(of([{ idDrink: '1', strDrink: 'A' }]));

    store.search('  abc  ');

    expect(apiMock.searchByName).toHaveBeenCalledWith('abc');
    expect(store.loading()).toBe(false);
    expect(store.searchTerm()).toBe('abc');
    expect(store.drinks().length).toBe(1);
  });

  it('search() clears drinks and loading on error', () => {
    apiMock.searchByName.and.returnValue(throwError(() => new Error('boom')));

    store.search('zzz');

    expect(store.loading()).toBe(false);
    expect(store.drinks()).toEqual([]);
  });

  it('searchByIngredient() guards empty input and trims', () => {
    apiMock.filterByIngredient.and.returnValue(of([{ idDrink: '2', strDrink: 'B' }]));

    store.searchByIngredient('   ');
    expect(apiMock.filterByIngredient).not.toHaveBeenCalled();

    store.searchByIngredient('   rum  ');
    expect(apiMock.filterByIngredient).toHaveBeenCalledWith('rum');
    expect(store.drinks().length).toBe(1);
    expect(store.loading()).toBe(false);
  });

  it('searchById() normalizes to digits only and guards empty', () => {
    apiMock.lookupById.and.returnValue(of([{ idDrink: '12', strDrink: 'C' }]));

    store.searchById('');
    expect(apiMock.lookupById).not.toHaveBeenCalled();

    store.searchById('  a1b2c  ');
    expect(apiMock.lookupById).toHaveBeenCalledWith('12');
    expect(store.drinks().length).toBe(1);
  });

  it('displayedDrinks and hasMore reflect paging and favorites', () => {
    // 15 drinks
    const drinks = Array.from({ length: 15 }, (_, i) => ({ idDrink: String(i + 1), strDrink: 'X' }));
    store.drinks.set(drinks as any);
    store.page.set(1);

    expect(store.displayedDrinks().length).toBe(10);
    expect(store.hasMore()).toBe(true);

    store.loadMore();
    expect(store.page()).toBe(2);
    expect(store.displayedDrinks().length).toBe(15);
    expect(store.hasMore()).toBe(false);

    // favorites filter
    store.favorites.set(['1', '3']);
    store.displayFavored.set(true);
    store.page.set(1);
    expect(store.displayedDrinks().map((d) => d.idDrink)).toEqual(['1', '3']);
  });

  it('toggleFavorite and isFavorited work as expected', () => {
    expect(store.isFavorited('9')).toBe(false);
    store.toggleFavorite('9');
    expect(store.isFavorited('9')).toBe(true);
    store.toggleFavorite('9');
    expect(store.isFavorited('9')).toBe(false);
  });

  it('toggleDisplayFavored flips flag and resets page', () => {
    store.page.set(3);
    const initial = store.displayFavored();
    store.toggleDisplayFavored();
    expect(store.displayFavored()).toBe(!initial);
    expect(store.page()).toBe(1);
  });

  it('loadMore does nothing when hasMore is false', () => {
    // fewer than pageSize drinks
    store.drinks.set(Array.from({ length: 5 }, (_, i) => ({ idDrink: String(i), strDrink: 'D' })) as any);
    store.page.set(1);
    expect(store.hasMore()).toBeFalse();
    store.loadMore();
    expect(store.page()).toBe(1);
  });

  it('search(undefined) uses default search term', () => {
    apiMock.searchByName.calls.reset();
    apiMock.searchByName.and.returnValue(of([]));
    store.search(undefined as any);
    expect(apiMock.searchByName).toHaveBeenCalled();
    const calledWith = apiMock.searchByName.calls.mostRecent().args[0];
    expect(calledWith).toBe(store.searchTerm());
  });

  it('cross-tab storage event updates state when payload valid', () => {
    const payload = {
      searchTerm: 'gin',
      drinks: [{ idDrink: '1', strDrink: 'X' }],
      page: 2,
      favorites: ['1'],
      displayFavored: true,
    };
    window.dispatchEvent(new StorageEvent('storage', { key: 'cocktails_state_v1', newValue: JSON.stringify(payload) }));
    expect(store.searchTerm()).toBe('gin');
    expect(store.drinks().length).toBe(1);
    expect(store.page()).toBe(2);
    expect(store.favorites()).toEqual(['1']);
    expect(store.displayFavored()).toBeTrue();
  });

  it('cross-tab storage event ignores corrupt JSON', () => {
    const before = {
      term: store.searchTerm(),
      count: store.drinks().length,
      page: store.page(),
      fav: store.favorites().slice(),
      disp: store.displayFavored(),
    };
    window.dispatchEvent(new StorageEvent('storage', { key: 'cocktails_state_v1', newValue: '{bad json' }));
    expect(store.searchTerm()).toBe(before.term);
    expect(store.drinks().length).toBe(before.count);
    expect(store.page()).toBe(before.page);
    expect(store.favorites()).toEqual(before.fav);
    expect(store.displayFavored()).toBe(before.disp);
  });

  it('state effect persists to localStorage on change', (done) => {
    (localStorage.setItem as jasmine.Spy).calls.reset();
    store.searchTerm.set('persist');
    setTimeout(() => {
      expect(localStorage.setItem).toHaveBeenCalled();
      done();
    }, 0);
  });
});


