import { Routes } from '@angular/router';
import { CocktailsPage } from './features/cocktails/components/cocktails.page';

export const routes: Routes = [
  { path: '', component: CocktailsPage },
  { path: '**', redirectTo: '' },
];
