import { Component, OnInit } from '@angular/core';
import { ModelService } from '../model.service';
import {Item} from '../item';
import { Instance } from '../database';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css']
})
export class ItemListComponent implements OnInit {

  constructor(private modelService: ModelService) { }
  items: Instance<Item>[];
  async ngOnInit(): Promise<void> {
    this.items = await this.modelService.getInstances('Item');
  }

}
