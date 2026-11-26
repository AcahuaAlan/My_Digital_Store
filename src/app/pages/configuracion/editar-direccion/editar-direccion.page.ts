import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  locationOutline,
  homeOutline,
  mapOutline,
  businessOutline,
  saveOutline,
} from 'ionicons/icons';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-editar-direccion',
  templateUrl: './editar-direccion.page.html',
  styleUrls: ['./editar-direccion.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon],
})
export class EditarDireccionPage {
  private navCtrl: NavController = inject(NavController);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  public calleNumero: string = '';
  public coloniaBarrio: string = '';
  public ciudadMunicipio: string = '';
  public mensajeError: string = '';

  private readonly KEY_DIRECCION: string = 'ddr_key_direccion';
  private readonly KEY_USERS: string = 'ddr_key_users';
  private readonly KEY_SESSION: string = 'ddr_key_session';

  constructor() {
    addIcons({
      'arrow-back-outline': arrowBackOutline,
      'location-outline': locationOutline,
      'home-outline': homeOutline,
      'map-outline': mapOutline,
      'business-outline': businessOutline,
      'save-outline': saveOutline,
    });
  }

  async ionViewWillEnter() {
    this.mensajeError = '';
    await this.cargarDireccionActual();
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

  private async cargarDireccionActual() {
    try {
      const dirRes = await Preferences.get({ key: this.KEY_DIRECCION });
      if (dirRes.value) {
        const parsed = JSON.parse(dirRes.value);
        if (parsed && typeof parsed === 'object') {
          this.calleNumero = String(parsed.calle ?? parsed.address ?? '').trim();
          this.coloniaBarrio = String(parsed.colonia ?? parsed.neighborhood ?? '').trim();
          this.ciudadMunicipio = String(parsed.ciudad ?? parsed.city ?? '').trim();

          if (!this.ciudadMunicipio && this.coloniaBarrio.includes(',')) {
            const partes = this.coloniaBarrio.split(',');
            this.coloniaBarrio = partes[0].trim();
            this.ciudadMunicipio = partes.slice(1).join(',').trim();
          }

          if (this.calleNumero || this.coloniaBarrio || this.ciudadMunicipio) {
            return;
          }
        }
      }

      const sesionRes = await Preferences.get({ key: this.KEY_SESSION });
      const usersRes = await Preferences.get({ key: this.KEY_USERS });

      let usuarioActivoNombre = '';
      if (sesionRes.value) {
        try {
          usuarioActivoNombre = this.normalizarNombreUsuario(JSON.parse(sesionRes.value));
        } catch {
          usuarioActivoNombre = this.normalizarNombreUsuario(sesionRes.value);
        }
      }

      if (usersRes.value) {
        const users = JSON.parse(usersRes.value);
        if (Array.isArray(users) && users.length > 0) {
          const usuario =
            (usuarioActivoNombre
              ? users.find(
                  (u: any) =>
                    this.normalizarNombreUsuario(u.username ?? u.usuario) === usuarioActivoNombre
                )
              : undefined) ?? users[users.length - 1];

          if (usuario) {
            this.calleNumero = String(usuario.address ?? usuario.calle ?? '').trim();
            this.coloniaBarrio = String(usuario.neighborhood ?? usuario.colonia ?? '').trim();
            this.ciudadMunicipio = String(usuario.city ?? usuario.ciudad ?? '').trim();
          }
        }
      }
    } catch (err) {
      console.error('Error al cargar dirección para editar:', err);
    }
  }

  public regresar() {
    this.navCtrl.back();
  }

  public async guardarDireccion() {
    this.mensajeError = '';

    const calle = this.calleNumero.trim();
    const colonia = this.coloniaBarrio.trim();
    const ciudad = this.ciudadMunicipio.trim();

    if (!calle && !colonia && !ciudad) {
      this.mensajeError = 'Ingresa al menos la calle y número o la colonia.';
      this.cdr.detectChanges();
      return;
    }

    const coloniaCompleta = [colonia, ciudad].filter(Boolean).join(', ').trim();

    try {
      await Preferences.set({
        key: this.KEY_DIRECCION,
        value: JSON.stringify({
          calle,
          colonia: coloniaCompleta,
          neighborhood: colonia,
          city: ciudad,
        }),
      });

      const sesionRes = await Preferences.get({ key: this.KEY_SESSION });
      const usersRes = await Preferences.get({ key: this.KEY_USERS });

      let usuarioActivoNombre = '';
      if (sesionRes.value) {
        try {
          usuarioActivoNombre = this.normalizarNombreUsuario(JSON.parse(sesionRes.value));
        } catch {
          usuarioActivoNombre = this.normalizarNombreUsuario(sesionRes.value);
        }
      }

      if (usersRes.value) {
        const users = JSON.parse(usersRes.value);
        if (Array.isArray(users) && users.length > 0) {
          const idx = usuarioActivoNombre
            ? users.findIndex(
                (u: any) =>
                  this.normalizarNombreUsuario(u.username ?? u.usuario) === usuarioActivoNombre
              )
            : users.length - 1;

          const targetIndex = idx >= 0 ? idx : users.length - 1;
          users[targetIndex] = {
            ...users[targetIndex],
            address: calle,
            neighborhood: colonia,
            city: ciudad,
          };

          await Preferences.set({
            key: this.KEY_USERS,
            value: JSON.stringify(users),
          });
        }
      }

      this.navCtrl.back();
    } catch (err) {
      console.error('Error al guardar dirección:', err);
      this.mensajeError = 'No se pudo guardar la dirección.';
      this.cdr.detectChanges();
    }
  }
}