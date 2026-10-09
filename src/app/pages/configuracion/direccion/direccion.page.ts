import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, 
  storefront, 
  pencilOutline, 
  trashOutline, 
  shieldCheckmarkOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-direccion',
  templateUrl: './direccion.page.html',
  styleUrls: ['./direccion.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon
  ]
})
export class DireccionPage {

  private navCtrl = inject(NavController);

  constructor() {
    addIcons({
      'arrow-back-outline': arrowBackOutline,
      'storefront': storefront,
      'pencil-outline': pencilOutline,
      'trash-outline': trashOutline,
      'shield-checkmark-outline': shieldCheckmarkOutline
    });
  }

  regresar() {
    this.navCtrl.back();
  }
}