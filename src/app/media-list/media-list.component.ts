import { Component, OnInit } from '@angular/core';
import { Instance } from '../database';
import { Book } from '../media';
import { ModelService } from '../model.service';

@Component({
  selector: 'app-media-list',
  templateUrl: './media-list.component.html',
  styleUrls: ['./media-list.component.css']
})
export class MediaListComponent implements OnInit {
  constructor(private modelService: ModelService) { }
  medialist: Instance<Book>[];
  async ngOnInit(): Promise<void> {
    this.medialist = await this.modelService.getInstances('Media', null, 0);
  }

}
