import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Usuario } from '../../models/usuario.model';
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
  IonIcon,
  IonAlert,
  NavController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';
import { Preferences } from '@capacitor/preferences';

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
    IonIcon,
    IonAlert
  ]
})
export class RegistroPage {
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private navCtrl: NavController = inject(NavController);

  // Campos actualizados para coincidir exactamente con todos los inputs del HTML
  public newUser: Usuario = {
    username: '',
    address: '',
    neighborhood: '',
    city: '',
    password: '',
    confirmPassword: '',
    securityQuestion: '',
    securityAnswer: ''
  };

  public mensajeError: string = '';
  public mensajeExito: string = '';

  // Estado de la alerta de éxito al crear usuario
  public alertaAbierta: boolean = false;
  public alertaHeader: string = '';
  public alertaMensaje: string = '';
  public alertaButtons = ['Aceptar'];

  // Arreglo que simula la base de datos de usuarios registrados
  public usersList: Usuario[] = [];
  
  private readonly KEY_USERS: string = 'ddr_key_users';

  constructor() {
    addIcons({ arrowBackOutline });
  }

  ionViewWillEnter() {
    this.mensajeError = '';
    this.mensajeExito = '';
    this.alertaAbierta = false;

    // Cargar los usuarios almacenados al entrar a la vista
    Preferences.get({ key: this.KEY_USERS }).then((res: { value: string | null }) => {
      if (res.value) {
        try {
          const parsed = JSON.parse(res.value);
          this.usersList = Array.isArray(parsed) ? (parsed as Usuario[]) : [];
        } catch {
          this.usersList = [];
        }
      } else {
        this.usersList = [];
      }
      this.cdr.detectChanges();
    });
  }

  private saveUsers() {
    Preferences.set({
      key: this.KEY_USERS,
      value: JSON.stringify(this.usersList),
    });
  }

  private normalizarUsuario(nombre?: string): string {
    return (nombre ?? '').trim().toLowerCase();
  }

  public onAlertaDismiss() {
    this.alertaAbierta = false;
    this.cdr.detectChanges();
    // Si quieres que al cerrar la alerta regrese al login, descomenta la siguiente línea:
    // this.navCtrl.navigateBack('/login');
  }

  public registerUser() {
    this.mensajeError = '';
    this.mensajeExito = '';

    const usernameLimpio = this.newUser.username.trim();

    // Validación básica de campos requeridos
    if (!usernameLimpio || !this.newUser.password) {
      this.mensajeError = 'Ingresa un nombre de usuario y una contraseña.';
      this.cdr.detectChanges();
      return;
    }

    // Evitar que se use un nombre de usuario ya existente
    const usuarioExiste = this.usersList.some(
      (user: Usuario) =>
        this.normalizarUsuario(user.username) === this.normalizarUsuario(usernameLimpio)
    );

    if (usuarioExiste) {
      this.mensajeError = 'Ese nombre de usuario ya está registrado. Elige otro.';
      alert('Ese nombre de usuario ya está registrado. Elige otro.');
      this.cdr.detectChanges();
      return;
    }

    // Validación: verificar que las contraseñas coincidan
    if (this.newUser.password !== this.newUser.confirmPassword) {
      console.log('Las contraseñas no coinciden');
      this.mensajeError = 'Las contraseñas no coinciden.';
      alert('Las contraseñas no coinciden.');
      this.cdr.detectChanges();
      return;
    }

    // Agregar el nuevo usuario al arreglo simulando la base de datos
    this.usersList.push({
      ...this.newUser,
      username: usernameLimpio,
      securityAnswer: (this.newUser.securityAnswer ?? '').trim(),
    });
    this.saveUsers();

    this.mensajeExito = 'Cuenta creada con éxito.';
    this.alertaHeader = '¡Cuenta creada!';
    this.alertaMensaje = `El usuario "${usernameLimpio}" se registró correctamente.`;
    this.alertaAbierta = true;

    // Limpiar formulario y reiniciar los campos
    this.newUser = {
      username: '',
      address: '',
      neighborhood: '',
      city: '',
      password: '',
      confirmPassword: '',
      securityQuestion: '',
      securityAnswer: ''
    };
    
    this.cdr.detectChanges();
    
    console.log('Usuario registrado con éxito. Base de datos actual:', this.usersList);
  }
}