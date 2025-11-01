import { SearchComponent } from './search.component';

describe('SearchComponent', () => {
  let comp: SearchComponent;

  beforeEach(() => {
    comp = new SearchComponent();
    (comp as any).input = {
      nativeElement: {
        value: '',
        addEventListener: () => {},
        removeEventListener: () => {},
      },
    };
    spyOn(localStorage, 'removeItem').and.stub();
  });

  it('onSearch emits trimmed value limited to MAX_LEN', (done) => {
    const long = '  x'.repeat(60) + 'end';
    (comp as any).input.nativeElement.value = long;
    comp.search.subscribe((v) => {
      expect(v.length).toBeLessThanOrEqual(comp.MAX_LEN);
      expect(v).toBe((long as string).slice(0, comp.MAX_LEN).trim());
      done();
    });
    comp.onSearch();
  });

  it('onSearch emits empty string when input empty', (done) => {
    (comp as any).input.nativeElement.value = '   ';
    comp.search.subscribe((v) => {
      expect(v).toBe('');
      done();
    });
    comp.onSearch();
  });

  it('clear empties input and removes storage key', () => {
    (comp as any).input.nativeElement.value = 'abc';
    comp.clear();
    expect((comp as any).input.nativeElement.value).toBe('');
    expect(localStorage.removeItem).toHaveBeenCalled();
  });
});


