import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { 
  IonContent, 
  IonList, 
  IonItem, 
  IonInput, 
  IonSelect, 
  IonSelectOption, 
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RouterModule,
    IonContent, 
    IonList, 
    IonItem, 
    IonInput, 
    IonSelect, 
    IonSelectOption, 
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon
  ]
})
export class RegistroPage implements OnInit {

  constructor() {
    // Registrar el ícono de la flecha de regreso
    addIcons({ arrowBackOutline });
  }

  ngOnInit() { }

}