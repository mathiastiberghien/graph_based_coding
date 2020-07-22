import { Component, OnInit } from '@angular/core';
import {ModelService} from '../model.service';
import {Instance} from '../database';
import {Movie} from '../media';

@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.css']
})
export class MovieListComponent implements OnInit {
  movies: Instance<Movie>[];
  constructor(
    private modelService: ModelService
  ) {
   }

  async ngOnInit(): Promise<void> {
    this.movies = await this.modelService.getInstances('Movie');
  }

}
