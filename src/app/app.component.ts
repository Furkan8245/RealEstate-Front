import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AreaAnalysisComponent } from './components/area-analysis/area-analysis.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,AreaAnalysisComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'RealEstateUI';
}
