import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { 
  IonContent, 
  IonButton, 
  IonIcon 
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, 
  chevronForwardOutline, 
  locationSharp, 
  lockClosedOutline, 
  peopleOutline, 
  cardSharp, 
  logOutOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink,
    IonContent, 
    IonButton, 
    IonIcon
  ]
})
export class PerfilPage implements OnInit {

  constructor() {
    addIcons({
      arrowBackOutline,
      chevronForwardOutline,
      locationSharp,
      lockClosedOutline,
      peopleOutline,
      cardSharp,
      logOutOutline
    });
  }

  ngOnInit() { }

}