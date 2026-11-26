import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { 
  IonContent, 
  IonList, 
  IonItem, 
  IonInput, 
  IonSelect, 
  IonSelectOption, 
  IonButton,
  IonIcon
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { lockClosedOutline } from 'ionicons/icons';
import { Preferences } from '@capacitor/preferences';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-recuperacion',
  templateUrl: './recuperacion.page.html',
  styleUrls: ['./recuperacion.page.scss'],
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
    IonIcon
  ]
})
export class RecuperacionPage {
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private router: Router = inject(Router);

  // Campos del formulario de recuperación
  public username: string = '';
  public securityQuestion: string = '';
  public securityAnswer: string = '';
  public newPassword: string = '';
  public confirmPassword: string = '';

  // Arreglo que carga la base de datos local de usuarios
  public registeredUsers: Usuario[] = [];
  private readonly KEY_USERS: string = 'ddr_key_users';

  constructor() {
    addIcons({ lockClosedOutline });
  }

  ionViewWillEnter() {
    // Carga los usuarios almacenados en Capacitor Preferences al entrar a la vista
    Preferences.get({ key: this.KEY_USERS }).then((res: { value: string | null }) => {
      if (res.value) {
        this.registeredUsers = JSON.parse(res.value) as Usuario[];
      } else {
        this.registeredUsers = [];
      }
      this.cdr.detectChanges();
    });
  }

  private saveUsers() {
    Preferences.set({
      key: this.KEY_USERS,
      value: JSON.stringify(this.registeredUsers),
    });
  }

  public resetPassword() {
    if (!this.username || !this.newPassword || !this.confirmPassword || !this.securityAnswer || !this.securityQuestion) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    // Buscamos al usuario en el arreglo simulando la base de datos
    const userIndex: number = this.registeredUsers.findIndex(
      (u: Usuario) => u.username && u.username.toLowerCase().trim() === this.username.toLowerCase().trim()
    );

    if (userIndex === -1) {
      alert('El usuario no existe.');
      return;
    }

    const targetUser: Usuario = this.registeredUsers[userIndex];

    // Comparamos la pregunta y limpiamos espacios de la respuesta secreta para evitar errores por mayúsculas o espacios accidentales
    const storedAnswer: string = targetUser.securityAnswer ? targetUser.securityAnswer.toLowerCase().trim() : '';
    const inputAnswer: string = this.securityAnswer.toLowerCase().trim();

    if (
      targetUser.securityQuestion === this.securityQuestion &&
      storedAnswer === inputAnswer
    ) {
      // Actualizamos la contraseña del usuario encontrado
      this.registeredUsers[userIndex].password = this.newPassword;
      this.saveUsers();

      alert('¡Contraseña actualizada con éxito!');
      this.router.navigateByUrl('/login');
    } else {
      alert('La pregunta o la respuesta secreta son incorrectas.');
    }
  }
}