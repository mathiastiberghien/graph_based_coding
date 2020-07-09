import { Component, OnInit, Input } from '@angular/core';
import { Role } from '../role';
import { ModelService } from '../model.service';
import { Person } from '../person';
import {Instance, InstanceRef} from '../instance';

@Component({
  selector: 'app-actor',
  templateUrl: './actor.component.html',
  styleUrls: ['./actor.component.css']
})
export class ActorComponent implements OnInit {
@Input() role: Role;
actor: Person;
  constructor(private modelService: ModelService) { }

  async ngOnInit(): Promise<void> {
    this.actor = this.role.actor;
  }

}
