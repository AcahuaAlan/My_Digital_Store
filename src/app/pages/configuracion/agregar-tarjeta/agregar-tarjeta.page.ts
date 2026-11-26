import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  cardOutline,
  personOutline,
  calendarOutline,
  informationCircleOutline,
  lockClosedOutline,
  saveOutline,
} from 'ionicons/icons';
import { Preferences } from '@capacitor/preferences';

interface TarjetaGuardada {
  marca: string;
  nombre: string;
  ultimos4: string;
  titular?: string;
  vencimiento?: string;
}

interface MetodoPagoStorage {
  metodoSeleccionado: string;
  tarjeta: TarjetaGuardada | null;
}

@Component({
  selector: 'app-agregar-tarjeta',
  templateUrl: './agregar-tarjeta.page.html',
  styleUrls: ['./agregar-tarjeta.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon],
})
export class AgregarTarjetaPage {
  private navCtrl: NavController = inject(NavController);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  public nombreEnTarjeta: string = '';
  public numeroTarjeta: string = '';
  public vencimiento: string = '';
  public cvv: string = '';
  public mostrarAyudaCvv: boolean = false;
  public mensajeError: string = '';

  private readonly KEY_METODO_PAGO: string = 'ddr_key_metodo_pago';

  constructor() {
    addIcons({
      'arrow-back-outline': arrowBackOutline,
      'card-outline': cardOutline,
      'person-outline': personOutline,
      'calendar-outline': calendarOutline,
      'information-circle-outline': informationCircleOutline,
      'lock-closed-outline': lockClosedOutline,
      'save-outline': saveOutline,
    });
  }

  ionViewWillEnter() {
    this.nombreEnTarjeta = '';
    this.numeroTarjeta = '';
    this.vencimiento = '';
    this.cvv = '';
    this.mostrarAyudaCvv = false;
    this.mensajeError = '';
    this.cdr.detectChanges();
  }

  public formatearNumeroTarjeta(valor: string) {
    const digitos = (valor ?? '').replace(/\D/g, '').slice(0, 16);
    const grupos = digitos.match(/.{1,4}/g) ?? [];
    this.numeroTarjeta = grupos.join(' ');
  }

  public formatearVencimiento(valor: string) {
    const digitos = (valor ?? '').replace(/\D/g, '').slice(0, 4);
    if (digitos.length > 2) {
      this.vencimiento = `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
    } else {
      this.vencimiento = digitos;
    }
  }

  public toggleCvvInfo() {
    this.mostrarAyudaCvv = !this.mostrarAyudaCvv;
    this.cdr.detectChanges();
  }

  public regresar() {
    this.navCtrl.back();
  }

  public async guardarTarjeta() {
    this.mensajeError = '';

    const digitos = this.numeroTarjeta.replace(/\D/g, '');
    if (digitos.length < 4) {
      this.mensajeError = 'Ingresa un número de tarjeta válido.';
      this.cdr.detectChanges();
      return;
    }

    const ultimos4 = digitos.slice(-4);
    const titularLimpio = this.nombreEnTarjeta.trim();
    const esMaster = digitos.startsWith('5');
    const marca = esMaster ? 'MC' : 'VISA';
    const nombreTarjeta = esMaster ? 'Mastercard Débito' : 'Visa Débito';

    const nuevaTarjeta: TarjetaGuardada = {
      marca,
      nombre: nombreTarjeta,
      ultimos4,
      titular: titularLimpio,
      vencimiento: this.vencimiento.trim(),
    };

    try {
      await Preferences.set({
        key: this.KEY_METODO_PAGO,
        value: JSON.stringify({
          metodoSeleccionado: 'tarjeta',
          tarjeta: nuevaTarjeta,
        } satisfies MetodoPagoStorage),
      });

      this.navCtrl.back();
    } catch (err) {
      console.error('Error al guardar tarjeta:', err);
      this.mensajeError = 'No se pudo guardar la tarjeta.';
      this.cdr.detectChanges();
    }
  }
}