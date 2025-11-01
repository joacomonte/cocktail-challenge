import { Component, ElementRef, EventEmitter, Output, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  @Output() readonly search = new EventEmitter<string>();
  @ViewChild('input', { static: true }) input!: ElementRef<HTMLInputElement>;

  readonly MAX_LEN = 50;
  private readonly storageKey = 'cocktails_search_input_v1';
  private inputListener = () => {
    try {
      const v = this.input?.nativeElement?.value ?? '';
      localStorage.setItem(this.storageKey, v);
    } catch {}
  };

  private storageListener = (e: StorageEvent) => {
    if (e.key === this.storageKey && this.input?.nativeElement) {
      const newVal = e.newValue ?? '';
      if (this.input.nativeElement.value !== newVal) this.input.nativeElement.value = newVal;
    }
  };

  ngOnInit(): void {
    try {
      const raw = localStorage.getItem(this.storageKey) || '';
      if (this.input?.nativeElement) this.input.nativeElement.value = raw;
    } catch {}
    try {
      this.input?.nativeElement?.addEventListener('input', this.inputListener);
      window.addEventListener('storage', this.storageListener);
    } catch {}
  }

  ngOnDestroy(): void {
    try {
      this.input?.nativeElement?.removeEventListener('input', this.inputListener);
      window.removeEventListener('storage', this.storageListener);
    } catch {}
  }

  clear() {
    if (this.input?.nativeElement) this.input.nativeElement.value = '';
    try {
      localStorage.removeItem(this.storageKey);
    } catch {}
  }

  onSearch(value?: string) {
    const raw = (value ?? this.input?.nativeElement?.value ?? '') as string;
    const trimmed = raw.slice(0, this.MAX_LEN).trim();
    this.search.emit(trimmed);
  }
}


