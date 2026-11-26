import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  shieldOutline,
  ellipseOutline,
  checkmarkCircleOutline,
  checkmarkOutline,
} from 'ionicons/icons';
import { Preferences } from '@capacitor/preferences';
import { Usuario } from '../../../models/usuario.model';

interface ContrasenaStorageData {
  password: string;
  actualizadaEn: string;
}

interface SessionData {
  username?: string;
}

type UsuarioConVariantes = Usuario & {
  contrasena?: string;
  pass?: string;
};

@Component({
  selector: 'app-contrasena',
  templateUrl: './contrasena.page.html',
  styleUrls: ['./contrasena.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
  ],
})
export class ContrasenaPage {
  private navCtrl: NavController = inject(NavController);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  public contrasenaActual: string = '';
  public nuevaContrasena: string = '';
  public confirmarContrasena: string = '';
  public mensajeError: string = '';
  public mensajeExito: string = '';

  private passwordGuardada: string = '';
  private usuarioActualUsername: string = '';
  private usersList: UsuarioConVariantes[] = [];

  private readonly KEY_CONTRASENA: string = 'ddr_key_contrasena';
  private readonly KEY_SESSION: string = 'ddr_key_session';
  private readonly KEY_USERS: string = 'ddr_key_users';

  constructor() {
    addIcons({
      'arrow-back-outline': arrowBackOutline,
      'shield-outline': shieldOutline,
      'ellipse-outline': ellipseOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'checkmark-outline': checkmarkOutline,
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
    this.nuevaContrasena = '';
    this.confirmarContrasena = '';
    this.passwordGuardada = '';
    this.usuarioActualUsername = '';
    this.usersList = [];

    const resUsers = await Preferences.get({ key: this.KEY_USERS });
    if (resUsers.value) {
      try {
        const parsedUsers = JSON.parse(resUsers.value);
        if (Array.isArray(parsedUsers)) {
          this.usersList = parsedUsers as UsuarioConVariantes[];
        }
      } catch {
        this.usersList = [];
      }
    }

    const resSession = await Preferences.get({ key: this.KEY_SESSION });
    if (resSession.value) {
      try {
        const session = JSON.parse(resSession.value) as SessionData;
        this.usuarioActualUsername = (session.username ?? '').trim();
      } catch {
        this.usuarioActualUsername = '';
      }
    }

    const usuarioEncontrado = this.usersList.find(
      (u: UsuarioConVariantes) =>
        this.normalizar(u.username) === this.normalizar(this.usuarioActualUsername)
    );

    if (usuarioEncontrado) {
      this.passwordGuardada = this.extraerPasswordDeObjeto(
        usuarioEncontrado as unknown as Record<string, unknown>
      );
    } else {
      const resPass = await Preferences.get({ key: this.KEY_CONTRASENA });
      if (resPass.value) {
        try {
          const data = JSON.parse(resPass.value) as Partial<ContrasenaStorageData>;
          this.passwordGuardada = (data.password ?? '').trim();
        } catch {
          this.passwordGuardada = '';
        }
      }
    }

    console.log('Session username:', this.usuarioActualUsername);
    console.log('Users en ddr_key_users:', this.usersList);
    console.log('Password detectada:', this.passwordGuardada);

    this.cdr.detectChanges();
  }

  public get tieneMinimo8(): boolean {
    return this.nuevaContrasena.length >= 8;
  }

  public get tieneNumero(): boolean {
    return /\d/.test(this.nuevaContrasena);
  }

  public get tieneMayuscula(): boolean {
    return /[A-Z]/.test(this.nuevaContrasena);
  }

  public get cumpleRequisitos(): boolean {
    return this.tieneMinimo8 && this.tieneNumero && this.tieneMayuscula;
  }

  private async saveContrasenaData(nuevaPass: string) {
    const registroContrasena: ContrasenaStorageData = {
      password: nuevaPass,
      actualizadaEn: new Date().toISOString(),
    };

    await Preferences.set({
      key: this.KEY_CONTRASENA,
      value: JSON.stringify(registroContrasena),
    });

    if (this.usuarioActualUsername && this.usersList.length > 0) {
      this.usersList = this.usersList.map((u: UsuarioConVariantes) => {
        if (this.normalizar(u.username) !== this.normalizar(this.usuarioActualUsername)) {
          return u;
        }
        const actualizado: UsuarioConVariantes = {
          ...u,
          password: nuevaPass,
          confirmPassword: nuevaPass,
        };
        if ('contrasena' in actualizado) {
          actualizado.contrasena = nuevaPass;
        }
        if ('pass' in actualizado) {
          actualizado.pass = nuevaPass;
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

  async actualizarContrasena() {
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

    if (!this.cumpleRequisitos) {
      this.mensajeError = 'La nueva contraseña no cumple con todos los requisitos.';
      this.cdr.detectChanges();
      return;
    }

    if (this.nuevaContrasena !== this.confirmarContrasena) {
      this.mensajeError = 'La confirmación no coincide con la nueva contraseña.';
      this.cdr.detectChanges();
      return;
    }

    if (this.nuevaContrasena === actualIngresada) {
      this.mensajeError = 'La nueva contraseña debe ser diferente a la actual.';
      this.cdr.detectChanges();
      return;
    }

    this.passwordGuardada = this.nuevaContrasena;
    await this.saveContrasenaData(this.nuevaContrasena);
    this.mensajeExito = 'Contraseña actualizada correctamente.';
    this.cdr.detectChanges();

    setTimeout(() => {
      this.navCtrl.back();
    }, 600);
  }

  olvidasteContrasena() {
    this.navCtrl.navigateForward('/recuperacion');
  }
}