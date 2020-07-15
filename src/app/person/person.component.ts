import { Component, OnInit, Input } from '@angular/core';
import { Person } from '../person';
import * as moment from 'moment';

@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.css']
})
export class PersonComponent implements OnInit {
@Input() person: Person;
age: number;
  constructor() { }

  ngOnInit(): void {
    if (this.person.dob){
       this.age = moment(Date.now()).diff(moment(this.person.dob), 'years');
    }
  }

}
