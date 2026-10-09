import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, 
  shieldOutline, 
  ellipseOutline, 
  checkmarkOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-contrasena',
  templateUrl: './contrasena.page.html',
  styleUrls: ['./contrasena.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon
  ]
})
export class ContrasenaPage {

  contrasenaActual: string = '';
  nuevaContrasena: string = '';
  confirmarContrasena: string = '';

  private navCtrl = inject(NavController);

  constructor() {
    addIcons({
      'arrow-back-outline': arrowBackOutline,
      'shield-outline': shieldOutline,
      'ellipse-outline': ellipseOutline,
      'checkmark-outline': checkmarkOutline
    });
  }

  regresar() {
    this.navCtrl.back();
  }

  actualizarContrasena() {
    console.log('Actualizando contraseña...');
    this.navCtrl.back();
  }

  olvidasteContrasena() {
    console.log('Navegar a recuperar contraseña');
  }

}