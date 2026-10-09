import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, 
  pencilOutline, 
  trashOutline, 
  cashOutline, 
  shieldCheckmarkOutline, 
  saveOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-metodo-pago',
  templateUrl: './metodo-pago.page.html',
  styleUrls: ['./metodo-pago.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon
  ]
})
export class MetodoPagoPage {

  metodoSeleccionado: string = 'efectivo';

  private navCtrl = inject(NavController);

  constructor() {
    addIcons({
      'arrow-back-outline': arrowBackOutline,
      'pencil-outline': pencilOutline,
      'trash-outline': trashOutline,
      'cash-outline': cashOutline,
      'shield-checkmark-outline': shieldCheckmarkOutline,
      'save-outline': saveOutline
    });
  }

  regresar() {
    this.navCtrl.back();
  }

  guardar() {
    console.log('Método guardado:', this.metodoSeleccionado);
    this.navCtrl.back();
  }

}