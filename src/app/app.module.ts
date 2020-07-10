import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { MovieListComponent } from './movie-list/movie-list.component';
import { RoleListComponent } from './role-list/role-list.component';
import { PersonComponent } from './person/person.component';
import { BookListComponent } from './book-list/book-list.component';
import { MediaListComponent } from './media-list/media-list.component';
import { ItemListComponent } from './item-list/item-list.component';

@NgModule({
  declarations: [
    AppComponent,
    TopBarComponent,
    MovieListComponent,
    RoleListComponent,
    PersonComponent,
    BookListComponent,
    MediaListComponent,
    ItemListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
