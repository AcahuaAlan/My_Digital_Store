import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonAlert } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline, pencil, saveOutline, exitOutline, person } from 'ionicons/icons';
import { Preferences } from '@capacitor/preferences';
import { Usuario } from '../../../models/usuario.model';

interface SessionData {
  username?: string;
}

type UsuarioPerfil = Usuario & {
  nombreCompleto?: string;
  nombreUsuario?: string;
  nombre?: string;
  email?: string;
};

@Component({
  selector: 'app-editar-perfil',
  templateUrl: './editar-perfil.page.html',
  styleUrls: ['./editar-perfil.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
    IonAlert
  ]
})
export class EditarPerfilPage {
  private router: Router = inject(Router);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  public nombreCompleto: string = '';
  public nombreUsuario: string = '';
  public mensajeError: string = '';

  public alertaAbierta: boolean = false;
  public alertaHeader: string = '';
  public alertaMensaje: string = '';
  public alertaButtons = ['Aceptar'];

  private usuarioOriginal: string = '';
  private usersList: UsuarioPerfil[] = [];

  private readonly KEY_PERFIL: string = 'ddr_key_perfil';
  private readonly KEY_SESSION: string = 'ddr_key_session';
  private readonly KEY_USERS: string = 'ddr_key_users';

  constructor() {
    addIcons({
      'arrow-back-outline': arrowBackOutline,
      'pencil': pencil,
      'save-outline': saveOutline,
      'exit-outline': exitOutline,
      'person': person
    });
  }

  private normalizar(valor?: string): string {
    return (valor ?? '').trim().toLowerCase();
  }

  async ionViewWillEnter() {
    this.mensajeError = '';
    this.alertaAbierta = false;
    this.usersList = [];
    this.usuarioOriginal = '';

    try {
      const resUsers = await Preferences.get({ key: this.KEY_USERS });
      if (resUsers.value) {
        const parsed = JSON.parse(resUsers.value);
        if (Array.isArray(parsed)) {
          this.usersList = parsed as UsuarioPerfil[];
        }
      }

      const resSession = await Preferences.get({ key: this.KEY_SESSION });
      let sessionUsername = '';
      if (resSession.value) {
        const session = JSON.parse(resSession.value) as SessionData;
        sessionUsername = (session.username ?? '').trim();
      }

      const resPerfil = await Preferences.get({ key: this.KEY_PERFIL });
      const perfilGuardado: Partial<UsuarioPerfil> = resPerfil.value
        ? (JSON.parse(resPerfil.value) as Partial<UsuarioPerfil>)
        : {};

      const usuarioActivo = this.usersList.find(
        (u: UsuarioPerfil) => this.normalizar(u.username) === this.normalizar(sessionUsername)
      );

      if (usuarioActivo) {
        this.usuarioOriginal = (usuarioActivo.username ?? '').trim();
        this.nombreUsuario = this.usuarioOriginal;
        this.nombreCompleto =
          usuarioActivo.nombreCompleto ??
          usuarioActivo.nombre ??
          perfilGuardado.nombreCompleto ??
          perfilGuardado.nombre ??
          this.usuarioOriginal;
      } else if (sessionUsername) {
        this.usuarioOriginal = sessionUsername;
        this.nombreUsuario = sessionUsername;
        this.nombreCompleto =
          perfilGuardado.nombreCompleto ?? perfilGuardado.nombre ?? sessionUsername;
      } else if (perfilGuardado.username || perfilGuardado.nombreUsuario) {
        this.usuarioOriginal = (
          perfilGuardado.username ??
          perfilGuardado.nombreUsuario ??
          ''
        ).trim();
        this.nombreUsuario = this.usuarioOriginal;
        this.nombreCompleto =
          perfilGuardado.nombreCompleto ??
          perfilGuardado.nombre ??
          (this.usuarioOriginal || 'Usuario');
      } else {
        this.nombreCompleto = 'Usuario';
        this.nombreUsuario = '';
      }
    } catch (err) {
      console.error('Error al cargar datos del perfil:', err);
    }

    this.cdr.detectChanges();
  }

  private async savePerfil(nombreLimpio: string, usuarioLimpio: string) {
    this.nombreCompleto = nombreLimpio;
    this.nombreUsuario = usuarioLimpio;

    const perfilActualizado: Partial<UsuarioPerfil> & {
      nombreCompleto: string;
      nombreUsuario: string;
      nombre: string;
      email: string;
    } = {
      username: usuarioLimpio,
      nombreCompleto: nombreLimpio,
      nombreUsuario: usuarioLimpio,
      nombre: nombreLimpio,
      email: usuarioLimpio
    };

    await Preferences.set({
      key: this.KEY_PERFIL,
      value: JSON.stringify(perfilActualizado),
    });

    if (this.usersList.length > 0 && this.usuarioOriginal) {
      this.usersList = this.usersList.map((u: UsuarioPerfil) => {
        if (this.normalizar(u.username) !== this.normalizar(this.usuarioOriginal)) {
          return u;
        }
        return {
          ...u,
          username: usuarioLimpio,
          nombreCompleto: nombreLimpio,
          nombre: nombreLimpio,
        };
      });

      await Preferences.set({
        key: this.KEY_USERS,
        value: JSON.stringify(this.usersList),
      });
    }

    await Preferences.set({
      key: this.KEY_SESSION,
      value: JSON.stringify({ username: usuarioLimpio }),
    });

    this.usuarioOriginal = usuarioLimpio;
  }

  public onAlertaDismiss() {
    this.alertaAbierta = false;
    this.cdr.detectChanges();
  }

  regresar() {
    this.router.navigate(['/tabs/perfil']);
  }

  async guardarCambios() {
    this.mensajeError = '';

    const nombreLimpio = this.nombreCompleto.trim();
    const usuarioLimpio = this.nombreUsuario.trim();

    if (!nombreLimpio) {
      this.mensajeError = 'Ingresa tu nombre completo.';
      this.cdr.detectChanges();
      return;
    }

    if (!usuarioLimpio) {
      this.mensajeError = 'Ingresa un nombre de usuario.';
      this.cdr.detectChanges();
      return;
    }

    // Verificar que ningún OTRO usuario ya tenga ese nombre de usuario
    const usuarioDuplicado = this.usersList.some(
      (u: UsuarioPerfil) =>
        this.normalizar(u.username) !== this.normalizar(this.usuarioOriginal) &&
        this.normalizar(u.username) === this.normalizar(usuarioLimpio)
    );

    if (usuarioDuplicado) {
      this.mensajeError = 'Ese nombre de usuario ya está en uso por otra cuenta.';
      this.alertaHeader = 'Usuario no disponible';
      this.alertaMensaje = `El nombre de usuario "${usuarioLimpio}" ya pertenece a otro usuario.`;
      this.alertaAbierta = true;
      this.cdr.detectChanges();
      return;
    }

    await this.savePerfil(nombreLimpio, usuarioLimpio);
    this.cdr.detectChanges();
    this.router.navigate(['/tabs/perfil']);
  }

  cerrarSesion() {
    this.router.navigate(['/login']);
  }
}