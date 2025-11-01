import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CocktailsApiService } from '../../../core/api/cocktails.api';
import { CocktailDetailComponent } from './cocktail-detail.component';

describe('CocktailDetailComponent', () => {
  let comp: CocktailDetailComponent;
  let apiMock: jasmine.SpyObj<CocktailsApiService>;
  const dialogRefMock = { close: jasmine.createSpy('close') } as Partial<MatDialogRef<CocktailDetailComponent>>;

  beforeEach(() => {
    apiMock = jasmine.createSpyObj('CocktailsApiService', ['getDetailsById']);

    TestBed.configureTestingModule({
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { id: '123' } },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: CocktailsApiService, useValue: apiMock },
        CocktailDetailComponent,
      ],
    });

    comp = TestBed.inject(CocktailDetailComponent);
  });

  it('ngOnInit fetches detail and updates loading flags', () => {
    apiMock.getDetailsById.and.returnValue(of({
      idDrink: '123',
      strDrink: 'Test',
      strInstructions: 'Mix',
      strIngredient1: 'Gin',
      strMeasure1: '50ml',
      strIngredient2: 'Tonic',
      strMeasure2: '100ml',
    } as any));

    comp.ngOnInit();
    expect(apiMock.getDetailsById).toHaveBeenCalledWith('123');
    expect(comp.loading).toBeFalse();
    expect(comp.detail).toBeTruthy();
    expect(comp.ingredients).toEqual([
      { ingredient: 'Gin', measure: '50ml' },
      { ingredient: 'Tonic', measure: '100ml' },
    ]);
  });

  it('instructions getter returns per selectedLang with fallback', () => {
    (comp as any).detail = {
      strInstructions: 'EN text',
      strInstructionsES: 'ES text',
    } as any;
    comp.selectedLang = 'ES';
    expect(comp.instructions).toBe('ES text');
    comp.selectedLang = 'FR';
    expect(comp.instructions).toBe('EN text');
  });

  it('handles error by clearing detail and loading', () => {
    apiMock.getDetailsById.and.returnValue(throwError(() => new Error('boom')));
    comp.ngOnInit();
    expect(comp.loading).toBeFalse();
    expect(comp.detail).toBeNull();
  });

  it('onImageLoad sets imageLoaded flag and close() closes dialog', () => {
    comp.onImageLoad();
    expect(comp.imageLoaded).toBeTrue();
    comp.close();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });

  it('handles empty id by not calling API and leaving detail null', () => {
    apiMock.getDetailsById.calls.reset();
    // replace injected data with whitespace id and call ngOnInit
    (comp as any).data = { id: '   ' };
    comp.ngOnInit();
    expect(apiMock.getDetailsById).not.toHaveBeenCalled();
    expect(comp.detail).toBeNull();
  });
});


