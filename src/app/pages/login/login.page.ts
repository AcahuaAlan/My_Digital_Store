import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { 
  IonContent, 
  IonAvatar, 
  IonList, 
  IonItem, 
  IonInput, 
  IonButton 
} from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
import { Usuario } from '../../models/usuario.model';

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
export class LoginPage {
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private router: Router = inject(Router);

  public username: string = '';
  public password: string = '';
  
  // Llaves de Capacitor Preferences
  private readonly KEY_SESSION: string = 'ddr_key_session';
  private readonly KEY_USERS: string = 'ddr_key_users'; // Misma llave que usas en el registro

  // Arreglo que contendrá la lista de usuarios simulando la base de datos
  public registeredUsers: Usuario[] = [];

  constructor() {}

  ionViewWillEnter() {
    // 1. Cargamos la "base de datos" de usuarios registrados al entrar a la vista de login
    Preferences.get({ key: this.KEY_USERS }).then((res: { value: string | null }) => {
      if (res.value) {
        this.registeredUsers = JSON.parse(res.value) as Usuario[];
      } else {
        this.registeredUsers = [];
      }
      this.cdr.detectChanges();
    });
  }

  // 2. Función que valida las credenciales contra el arreglo
  public onLogin() {
    // Buscamos si existe un usuario que coincida en username y password
    const foundUser: Usuario | undefined = this.registeredUsers.find(
      (user: Usuario) => user.username === this.username && user.password === this.password
    );

    if (foundUser) {
      console.log('¡Login exitoso!', foundUser);
      
      // Guardamos la sesión activa
      Preferences.set({
        key: this.KEY_SESSION,
        value: JSON.stringify({ username: foundUser.username }),
      }).then(() => {
        // Redirigimos manualmente a la tienda
        this.router.navigateByUrl('/tabs/tienda');
      });

    } else {
      console.log('Error: Usuario o contraseña incorrectos');
      alert('Usuario o contraseña incorrectos. Verifica tus datos.');
    }
  }
}