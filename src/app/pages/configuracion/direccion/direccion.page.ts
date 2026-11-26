import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonIcon, NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  storefront,
  pencilOutline,
  trashOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { Preferences } from '@capacitor/preferences';

export interface DireccionData {
  calle: string;
  colonia: string;
}

interface UsuarioStorage {
  username?: string;
  usuario?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
}

@Component({
  selector: 'app-direccion',
  templateUrl: './direccion.page.html',
  styleUrls: ['./direccion.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon,
  ],
})
export class DireccionPage {
  private navCtrl: NavController = inject(NavController);
  private router: Router = inject(Router);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  public direccionData: DireccionData = {
    calle: '',
    colonia: '',
  };

  private readonly KEY_DIRECCION: string = 'ddr_key_direccion';
  private readonly KEY_USERS: string = 'ddr_key_users';
  private readonly KEY_SESSION: string = 'ddr_key_session';

  constructor() {
    addIcons({
      'arrow-back-outline': arrowBackOutline,
      'storefront': storefront,
      'pencil-outline': pencilOutline,
      'trash-outline': trashOutline,
      'shield-checkmark-outline': shieldCheckmarkOutline,
    });
  }

  async ionViewWillEnter() {
    await this.cargarDireccionUsuario();
    this.cdr.detectChanges();
  }

  private normalizarNombreUsuario(val: any): string {
    if (!val) {
      return '';
    }
    if (typeof val === 'string') {
      return val.trim().toLowerCase();
    }
    if (typeof val === 'object') {
      return String(
        val.username ?? val.usuario ?? val.user ?? val.nombre ?? ''
      )
        .trim()
        .toLowerCase();
    }
    return '';
  }

  private extraerDireccion(obj: any): DireccionData {
    if (!obj || typeof obj !== 'object') {
      return { calle: '', colonia: '' };
    }

    const calle = String(
      obj.address ?? obj.calle ?? ''
    ).trim();

    const colonia = String(obj.neighborhood ?? obj.colonia ?? '').trim();
    const ciudad = String(obj.city ?? obj.ciudad ?? '').trim();

    return {
      calle,
      colonia: [colonia, ciudad].filter(Boolean).join(', ').trim(),
    };
  }

  private async cargarDireccionUsuario() {
    try {
      const sesionRes = await Preferences.get({ key: this.KEY_SESSION });
      const usersRes = await Preferences.get({ key: this.KEY_USERS });

      let usuarioActivoNombre = '';
      let sesionParsed: any = null;

      if (sesionRes.value) {
        try {
          sesionParsed = JSON.parse(sesionRes.value);
        } catch {
          sesionParsed = sesionRes.value;
        }
        usuarioActivoNombre = this.normalizarNombreUsuario(sesionParsed);
      }

      // 1. Buscar en ddr_key_users el usuario activo (o el último registrado)
      if (usersRes.value) {
        const users = JSON.parse(usersRes.value);
        if (Array.isArray(users) && users.length > 0) {
          let usuarioEncontrado: UsuarioStorage | undefined;

          if (usuarioActivoNombre) {
            usuarioEncontrado = users.find(
              (u: UsuarioStorage) =>
                this.normalizarNombreUsuario(u.username ?? u.usuario) === usuarioActivoNombre
            );
          }

          if (!usuarioEncontrado) {
            usuarioEncontrado = users[users.length - 1];
          }

          if (usuarioEncontrado) {
            const dirUsuario = this.extraerDireccion(usuarioEncontrado);
            if (dirUsuario.calle || dirUsuario.colonia) {
              this.direccionData = dirUsuario;
              await this.saveDireccion();
              return;
            }
          }
        }
      }

      // 2. Revisar si la sesión trae directamente address/neighborhood/city
      if (sesionParsed) {
        const dirSesion = this.extraerDireccion(sesionParsed);
        if (dirSesion.calle || dirSesion.colonia) {
          this.direccionData = dirSesion;
          await this.saveDireccion();
          return;
        }
      }

      // 3. Revisar ddr_key_direccion si ya existía guardada
      const dirRes = await Preferences.get({ key: this.KEY_DIRECCION });
      if (dirRes.value) {
        const parsed = JSON.parse(dirRes.value) as Partial<DireccionData>;
        this.direccionData = {
          calle: (parsed.calle ?? '').trim(),
          colonia: (parsed.colonia ?? '').trim(),
        };
        return;
      }

      this.direccionData = { calle: '', colonia: '' };
    } catch (err) {
      console.error('Error al cargar dirección en DireccionPage:', err);
    }
  }

  private async saveDireccion() {
    await Preferences.set({
      key: this.KEY_DIRECCION,
      value: JSON.stringify(this.direccionData),
    });
  }

  public editarDireccion() {
    this.router.navigateByUrl('/editar-direccion');
  }

  public async eliminarDireccion() {
    this.direccionData = { calle: '', colonia: '' };
    await this.saveDireccion();
    this.cdr.detectChanges();
  }

  regresar() {
    this.navCtrl.back();
  }
}