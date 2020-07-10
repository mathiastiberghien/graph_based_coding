import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MovieListComponent } from './movie-list/movie-list.component';
import { MediaListComponent } from './media-list/media-list.component';
import { BookListComponent } from './book-list/book-list.component';
import { ItemListComponent } from './item-list/item-list.component';


const routes: Routes = [
    {path: '', component: MovieListComponent},
    {path: 'movies', component: MovieListComponent},
    {path: 'media', component: MediaListComponent},
    {path: 'books', component: BookListComponent},
    {path: 'items', component: ItemListComponent}
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
