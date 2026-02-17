import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css'
})
export class EmptyStateComponent {
  @Input() title:string="KAYIT BULUNAMADI";
  @Input() message:string="Görüntülenecek veriniz bulunmaktadır.";
  @Input() icon:string='fa-database';
  @Input() buttonText:string='YENİ EKLE';
  @Input() showButton:boolean=true;

  @Output() actionClicked=new EventEmitter<void>();

 onBtnClick(): void {
    this.actionClicked.emit();
  }

}
