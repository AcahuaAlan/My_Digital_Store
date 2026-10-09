import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-cambiar-pregunta',
  templateUrl: './cambiar-pregunta.page.html',
  styleUrls: ['./cambiar-pregunta.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule, FormsModule]
})
export class CambiarPreguntaPage implements OnInit {

  contrasenaActual: string = '';
  preguntaSeleccionada: string = '';
  respuesta: string = '';
  confirmarRespuesta: string = '';

  constructor(private navCtrl: NavController) { }

  ngOnInit() {
  }

  regresar() {
    this.navCtrl.back();
  }

  olvidasteContrasena() {
    // Por definir
  }

  guardarPregunta() {
    // Por definir
  }

}