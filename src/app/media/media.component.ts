import { Component, OnInit, Input } from '@angular/core';
import { Media } from '../media';
import * as moment from 'moment';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.css']
})
export class MediaComponent implements OnInit {
  moment = moment;
  constructor() { }
  @Input() media:Media;
  ngOnInit(): void {
  }

}
