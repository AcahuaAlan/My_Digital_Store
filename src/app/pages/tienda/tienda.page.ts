import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonGrid, 
  IonRow, 
  IonCol, 
  IonButton, 
  IonIcon 
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  locationOutline, 
  location, 
  searchOutline, 
  personCircleOutline, 
  chevronDownOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-tienda',
  templateUrl: './tienda.page.html',
  styleUrls: ['./tienda.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonContent, 
    IonGrid, 
    IonRow, 
    IonCol, 
    IonButton, 
    IonIcon
  ]
})
export class TiendaPage implements OnInit {

  constructor() {
    // Registrar íconos utilizados en la cabecera, buscador y dirección
    addIcons({
      locationOutline,
      location,
      searchOutline,
      personCircleOutline,
      chevronDownOutline
    });
  }

  ngOnInit() { }

}