import { Component } from '@angular/core';
import { ModelService } from './model.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'graph-based-app';
  constructor(private modelService: ModelService){
    this.modelService.buildSample();
  }
}
