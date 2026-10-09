import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-cambiar-pregunta',
  templateUrl: './cambiar-pregunta.page.html',
  styleUrls: ['./cambiar-pregunta.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class CambiarPreguntaPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
