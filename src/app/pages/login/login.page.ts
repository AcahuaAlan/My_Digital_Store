import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonAvatar, 
  IonList, 
  IonItem, 
  IonInput, 
  IonButton 
} from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    IonContent, 
    IonAvatar, 
    IonList, 
    IonItem, 
    IonInput, 
    IonButton
  ] 
})
export class LoginPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}