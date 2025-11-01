import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { IngredientSearchComponent } from './ingredient-search.component';
import { CocktailsApiService } from '../../../core/api/cocktails.api';

describe('IngredientSearchComponent', () => {
  let comp: IngredientSearchComponent;
  let apiMock: jasmine.SpyObj<CocktailsApiService>;

  beforeEach(() => {
    apiMock = jasmine.createSpyObj('CocktailsApiService', ['listIngredients']);

    TestBed.configureTestingModule({
      providers: [
        { provide: CocktailsApiService, useValue: apiMock },
        IngredientSearchComponent,
      ],
    });

    comp = TestBed.inject(IngredientSearchComponent);
    // stub input element
    (comp as any).input = {
      nativeElement: {
        value: '',
        addEventListener: () => {},
        removeEventListener: () => {},
      },
    };
  });

  it('ngOnInit loads ingredients and initializes filtered', () => {
    apiMock.listIngredients.and.returnValue(of(['Lime', 'Rum', 'Mint']));
    comp.ngOnInit();
    expect(comp.ingredients.length).toBe(3);
    expect(comp.filtered.length).toBe(3);
  });

  it('onInput sanitizes to digits (current impl) and filters list', () => {
    comp.ingredients = ['Rum', 'Lime', 'Vodka'];
    (comp as any).input.nativeElement.value = '';
    comp.onInput('12a');
    expect((comp as any).input.nativeElement.value).toBe('12');
    // filter uses lowercased includes; with digits, will likely produce empty filtered
    expect(comp.filtered.length).toBe(0);
  });

  it('onSearch emits sanitized digits and ignores empty', (done) => {
    (comp as any).input.nativeElement.value = 'Rum 1!';
    comp.search.subscribe((v) => {
      expect(v).toBe('1');
      done();
    });
    comp.onSearch();
  });

  it('onSearch does nothing when sanitized is empty', () => {
    let emitted = false;
    comp.search.subscribe(() => (emitted = true));
    comp.onSearch('abc'); // no digits => sanitized becomes ''
    expect(emitted).toBeFalse();
  });

  it('onOptionSelected sets input value and emits', (done) => {
    comp.search.subscribe((v) => {
      expect(v).toBe('Vodka');
      expect((comp as any).input.nativeElement.value).toBe('Vodka');
      done();
    });
    comp.onOptionSelected('Vodka');
  });

  it('clear resets input and filtered list', () => {
    comp.ingredients = ['A', 'B', 'C'];
    comp.filtered = [];
    (comp as any).input.nativeElement.value = 'x';
    spyOn(localStorage, 'removeItem').and.stub();
    comp.clear();
    expect((comp as any).input.nativeElement.value).toBe('');
    expect(comp.filtered).toEqual(['A', 'B', 'C']);
  });
});


