import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonIcon,
  IonSelect,
  IonSelectOption,
  NavController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  shieldCheckmarkOutline,
  chevronDownOutline,
  saveOutline,
} from 'ionicons/icons';
import { Preferences } from '@capacitor/preferences';
import { Usuario } from '../../../models/usuario.model';

interface PreguntaStorageData {
  preguntaSeleccionada: string;
  respuesta: string;
}

interface ContrasenaStorageData {
  password: string;
}

interface SessionData {
  username?: string;
}

type UsuarioConVariantes = Usuario & {
  contrasena?: string;
  pass?: string;
  preguntaSeguridad?: string;
  respuestaSeguridad?: string;
};

@Component({
  selector: 'app-cambiar-pregunta',
  templateUrl: './cambiar-pregunta.page.html',
  styleUrls: ['./cambiar-pregunta.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonIcon,
    IonSelect,
    IonSelectOption,
    CommonModule,
    FormsModule,
  ],
})
export class CambiarPreguntaPage {
  private navCtrl: NavController = inject(NavController);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  public contrasenaActual: string = '';
  public preguntaSeleccionada: string = '';
  public respuesta: string = '';
  public confirmarRespuesta: string = '';
  public mensajeError: string = '';
  public mensajeExito: string = '';

  private passwordGuardada: string = '';
  private usuarioActualUsername: string = '';
  private usersList: UsuarioConVariantes[] = [];

  private readonly KEY_PREGUNTA: string = 'ddr_key_pregunta_seguridad';
  private readonly KEY_CONTRASENA: string = 'ddr_key_contrasena';
  private readonly KEY_SESSION: string = 'ddr_key_session';
  private readonly KEY_USERS: string = 'ddr_key_users';

  constructor() {
    addIcons({
      'arrow-back-outline': arrowBackOutline,
      'shield-checkmark-outline': shieldCheckmarkOutline,
      'chevron-down-outline': chevronDownOutline,
      'save-outline': saveOutline,
    });
  }

  private normalizar(valor?: string): string {
    return (valor ?? '').trim().toLowerCase();
  }

  private extraerPasswordDeObjeto(obj: Record<string, unknown>): string {
    const candidatos = ['password', 'contrasena', 'pass'];
    for (const campo of candidatos) {
      const val = obj[campo];
      if (typeof val === 'string' && val.trim()) {
        return val.trim();
      }
    }
    return '';
  }

  async ionViewWillEnter() {
    this.mensajeError = '';
    this.mensajeExito = '';
    this.contrasenaActual = '';
    this.preguntaSeleccionada = '';
    this.respuesta = '';
    this.confirmarRespuesta = '';
    this.passwordGuardada = '';
    this.usuarioActualUsername = '';
    this.usersList = [];

    try {
      const resUsers = await Preferences.get({ key: this.KEY_USERS });
      if (resUsers.value) {
        const parsedUsers = JSON.parse(resUsers.value);
        if (Array.isArray(parsedUsers)) {
          this.usersList = parsedUsers as UsuarioConVariantes[];
        }
      }

      const resSession = await Preferences.get({ key: this.KEY_SESSION });
      if (resSession.value) {
        const session = JSON.parse(resSession.value) as SessionData;
        this.usuarioActualUsername = (session.username ?? '').trim();
      }

      const usuarioEncontrado = this.usersList.find(
        (u: UsuarioConVariantes) =>
          this.normalizar(u.username) === this.normalizar(this.usuarioActualUsername)
      );

      if (usuarioEncontrado) {
        this.passwordGuardada = this.extraerPasswordDeObjeto(
          usuarioEncontrado as unknown as Record<string, unknown>
        );
      }

      if (!this.passwordGuardada) {
        const resPass = await Preferences.get({ key: this.KEY_CONTRASENA });
        if (resPass.value) {
          const passData = JSON.parse(resPass.value) as Partial<ContrasenaStorageData>;
          if (passData?.password) {
            this.passwordGuardada = passData.password.trim();
          }
        }
      }
    } catch (err) {
      console.error('Error al cargar datos en cambiar-pregunta:', err);
    }

    this.cdr.detectChanges();
  }

  private async savePregunta() {
    const respuestaLimpia = this.respuesta.trim();

    const preguntaData: PreguntaStorageData = {
      preguntaSeleccionada: this.preguntaSeleccionada,
      respuesta: respuestaLimpia,
    };

    await Preferences.set({
      key: this.KEY_PREGUNTA,
      value: JSON.stringify(preguntaData),
    });

    if (this.usuarioActualUsername && this.usersList.length > 0) {
      this.usersList = this.usersList.map((u: UsuarioConVariantes) => {
        if (this.normalizar(u.username) !== this.normalizar(this.usuarioActualUsername)) {
          return u;
        }
        const actualizado: UsuarioConVariantes = {
          ...u,
          securityQuestion: this.preguntaSeleccionada,
          securityAnswer: respuestaLimpia,
        };
        if ('preguntaSeguridad' in actualizado) {
          actualizado.preguntaSeguridad = this.preguntaSeleccionada;
        }
        if ('respuestaSeguridad' in actualizado) {
          actualizado.respuestaSeguridad = respuestaLimpia;
        }
        return actualizado;
      });

      await Preferences.set({
        key: this.KEY_USERS,
        value: JSON.stringify(this.usersList),
      });
    }
  }

  regresar() {
    this.navCtrl.back();
  }

  olvidasteContrasena() {
    this.navCtrl.navigateForward('/recuperacion');
  }

  async guardarPregunta() {
    this.mensajeError = '';
    this.mensajeExito = '';

    const actualIngresada = this.contrasenaActual.trim();

    if (!actualIngresada) {
      this.mensajeError = 'Ingresa tu contraseña actual.';
      this.cdr.detectChanges();
      return;
    }

    if (!this.passwordGuardada || actualIngresada !== this.passwordGuardada) {
      this.mensajeError = 'La contraseña actual no es correcta.';
      this.cdr.detectChanges();
      return;
    }

    if (!this.preguntaSeleccionada) {
      this.mensajeError = 'Selecciona una pregunta de recuperación.';
      this.cdr.detectChanges();
      return;
    }

    if (!this.respuesta.trim()) {
      this.mensajeError = 'Escribe una respuesta de recuperación.';
      this.cdr.detectChanges();
      return;
    }

    if (this.respuesta.trim().toLowerCase() !== this.confirmarRespuesta.trim().toLowerCase()) {
      this.mensajeError = 'La confirmación no coincide con la respuesta.';
      this.cdr.detectChanges();
      return;
    }

    try {
      this.respuesta = this.respuesta.trim();
      await this.savePregunta();
      this.confirmarRespuesta = '';
      this.contrasenaActual = '';
      this.mensajeExito = 'Pregunta de recuperación guardada correctamente.';
      this.cdr.detectChanges();

      setTimeout(() => {
        this.navCtrl.back();
      }, 700);
    } catch (err) {
      console.error('Error al guardar pregunta:', err);
      this.mensajeError = 'No se pudo guardar. Revisa la consola.';
      this.cdr.detectChanges();
    }
  }
}