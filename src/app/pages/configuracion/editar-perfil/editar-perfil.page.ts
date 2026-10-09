import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonButtons, 
  IonBackButton, 
  IonTitle, 
  IonContent, 
  IonIcon 
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline, pencil, saveOutline, exitOutline, person } from 'ionicons/icons';

@Component({
  selector: 'app-editar-perfil',
  templateUrl: './editar-perfil.page.html',
  styleUrls: ['./editar-perfil.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonIcon
  ]
})
export class EditarPerfilPage {

  nombreCompleto: string = '';
  nombreUsuario: string = '';

  private router = inject(Router);

  constructor() {
    addIcons({
      'arrow-back-outline': arrowBackOutline,
      'pencil': pencil,
      'save-outline': saveOutline,
      'exit-outline': exitOutline,
      'person': person
    });
  }

  guardarCambios() {
    console.log('Guardando cambios:', this.nombreCompleto, this.nombreUsuario);

    this.router.navigate(['/tabs/perfil']);
  }

  cerrarSesion() {
    console.log('Cerrando sesión...');
    this.router.navigate(['/login']); 
  }

}