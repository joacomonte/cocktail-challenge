import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { CocktailsPage } from './cocktails.page';
import { CocktailsStore } from '../services/cocktails.store';

describe('CocktailsPage', () => {
  let page: CocktailsPage;
  let dialogMock: jasmine.SpyObj<MatDialog>;
  let storeMock: {
    search: jasmine.Spy;
    searchByIngredient: jasmine.Spy;
    searchById: jasmine.Spy;
    loadMore: jasmine.Spy;
    hasMore: () => boolean;
    loading: () => boolean;
  };

  beforeEach(() => {
    dialogMock = jasmine.createSpyObj('MatDialog', ['open']);
    storeMock = {
      search: jasmine.createSpy('search'),
      searchByIngredient: jasmine.createSpy('searchByIngredient'),
      searchById: jasmine.createSpy('searchById'),
      loadMore: jasmine.createSpy('loadMore'),
      hasMore: () => true,
      loading: () => false,
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: MatDialog, useValue: dialogMock },
        { provide: CocktailsStore, useValue: storeMock },
        CocktailsPage,
      ],
    });

    page = TestBed.inject(CocktailsPage);
  });

  it('seeDetails opens dialog when id present', () => {
    page.seeDetails({ idDrink: '123' });
    expect(dialogMock.open).toHaveBeenCalled();
  });

  it('seeDetails does nothing when id missing', () => {
    dialogMock.open.calls.reset();
    page.seeDetails({});
    expect(dialogMock.open).not.toHaveBeenCalled();
  });

  it('onSearchByName delegates to store.search', () => {
    page.onSearchByName('  mojito  ');
    expect(storeMock.search).toHaveBeenCalledWith('  mojito  ');
  });

  it('onSearchByIngredient and onSearchById delegate to store', () => {
    page.onSearchByIngredient('rum');
    expect(storeMock.searchByIngredient).toHaveBeenCalledWith('rum');
    page.onSearchById('123');
    expect(storeMock.searchById).toHaveBeenCalledWith('123');
  });

  it('onScroll loads more when near bottom, has more and not loading', () => {
    const el: any = { scrollTop: 152, clientHeight: 100, scrollHeight: 300 };
    const evt = { target: el } as unknown as Event;
    page.onScroll(evt);
    expect(storeMock.loadMore).toHaveBeenCalled();
  });

  it('onScroll does not load when hasMore is false', () => {
    storeMock.loadMore.calls.reset();
    storeMock.hasMore = () => false;
    const el: any = { scrollTop: 500, clientHeight: 100, scrollHeight: 600 };
    page.onScroll({ target: el } as any);
    expect(storeMock.loadMore).not.toHaveBeenCalled();
  });

  it('onScroll does not load when loading is true', () => {
    storeMock.loadMore.calls.reset();
    storeMock.hasMore = () => true;
    storeMock.loading = () => true;
    const el: any = { scrollTop: 500, clientHeight: 100, scrollHeight: 600 };
    page.onScroll({ target: el } as any);
    expect(storeMock.loadMore).not.toHaveBeenCalled();
  });

  it('onScroll persists scrollTop to localStorage', () => {
    spyOn(localStorage, 'setItem').and.stub();
    const el: any = { scrollTop: 123, clientHeight: 100, scrollHeight: 200 };
    page.onScroll({ target: el } as any);
    expect(localStorage.setItem).toHaveBeenCalledWith('cocktails_scroll_top_v1', '123');
  });

  it('ngAfterViewInit restores last-known scrollTop and registers storage listener', () => {
    spyOn(localStorage, 'getItem').and.returnValue('50');
    spyOn(window, 'addEventListener');
    const container = { nativeElement: { scrollTop: 0 } } as any;
    (page as any).scrollContainer = container;
    spyOn(window, 'setTimeout').and.callFake((fn: any) => {
      fn();
      return 0 as any;
    });
    page.ngAfterViewInit();
    expect(container.nativeElement.scrollTop).toBe(50);
    expect(window.addEventListener).toHaveBeenCalledWith('storage', jasmine.any(Function));
  });

  it('ngOnDestroy removes storage listener', () => {
    spyOn(window, 'removeEventListener');
    page.ngOnDestroy();
    expect(window.removeEventListener).toHaveBeenCalledWith('storage', jasmine.any(Function));
  });
});


