import { IdSearchComponent } from './id-search.component';

describe('IdSearchComponent', () => {
  let comp: IdSearchComponent;

  beforeEach(() => {
    comp = new IdSearchComponent();
    (comp as any).input = {
      nativeElement: {
        value: '',
        addEventListener: () => {},
        removeEventListener: () => {},
      },
    };
    spyOn(localStorage, 'removeItem').and.stub();
  });

  it('onSearch emits digits-only trimmed to MAX_LEN', (done) => {
    const val = '  a1b2c3d4e5f6g7h8i9j0k '; // more than 20 chars when digits and letters combined
    (comp as any).input.nativeElement.value = val;
    comp.search.subscribe((v) => {
      expect(v).toMatch(/^[0-9]+$/);
      expect(v.length).toBeLessThanOrEqual(comp.MAX_LEN);
      done();
    });
    comp.onSearch();
  });

  it('onSearch does nothing when no digits present', () => {
    let emitted = false;
    comp.search.subscribe(() => (emitted = true));
    (comp as any).input.nativeElement.value = 'abc';
    comp.onSearch();
    expect(emitted).toBeFalse();
  });

  it('clear empties input and removes storage key', () => {
    (comp as any).input.nativeElement.value = '123';
    comp.clear();
    expect((comp as any).input.nativeElement.value).toBe('');
    expect(localStorage.removeItem).toHaveBeenCalled();
  });
});


