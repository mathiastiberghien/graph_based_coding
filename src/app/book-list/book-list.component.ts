import { Component, OnInit } from '@angular/core';
import { ModelService } from '../model.service';
import { Book} from '../media';
import { Instance} from '../database';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit {
  books: Instance<Book>[];
  constructor(
    private modelService: ModelService
  ) { }

  async ngOnInit(): Promise<void> {
    this.books = await this.modelService.getInstances<Book>('Book');
  }

}
