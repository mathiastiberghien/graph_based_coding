import { Component, OnInit, Input } from '@angular/core';
import { ModelService } from '../model.service';
import { Movie } from '../media';
import {Role} from '../role';

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.css']
})
export class RoleListComponent implements OnInit {

  constructor(private modelService: ModelService) { }
  @Input() movie: Movie;
  roles: Role[];
  async ngOnInit(): Promise<void> {
    this.roles = this.movie ? this.movie.roles : [];
  }

}
