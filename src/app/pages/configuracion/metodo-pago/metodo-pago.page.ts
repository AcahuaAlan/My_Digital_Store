import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon, NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  trashOutline,
  cashOutline,
  shieldCheckmarkOutline,
  saveOutline,
  cardOutline,
  addCircleOutline,
} from 'ionicons/icons';
import { Preferences } from '@capacitor/preferences';

interface TarjetaGuardada {
  marca: string;
  nombre: string;
  ultimos4: string;
}

interface MetodoPagoStorage {
  metodoSeleccionado: string;
  tarjeta: TarjetaGuardada | null;
}

@Component({
  selector: 'app-metodo-pago',
  templateUrl: './metodo-pago.page.html',
  styleUrls: ['./metodo-pago.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
  ],
})
export class MetodoPagoPage {
  private navCtrl: NavController = inject(NavController);
  private router: Router = inject(Router);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  public metodoSeleccionado: string = 'efectivo';
  public tarjetaRegistrada: TarjetaGuardada | null = {
    marca: 'VISA',
    nombre: 'Visa Débito',
    ultimos4: '1094',
  };

  private readonly KEY_METODO_PAGO: string = 'ddr_key_metodo_pago';

  constructor() {
    addIcons({
      'arrow-back-outline': arrowBackOutline,
      'trash-outline': trashOutline,
      'cash-outline': cashOutline,
      'shield-checkmark-outline': shieldCheckmarkOutline,
      'save-outline': saveOutline,
      'card-outline': cardOutline,
      'add-circle-outline': addCircleOutline,
    });
  }

  async ionViewWillEnter() {
    try {
      const res = await Preferences.get({ key: this.KEY_METODO_PAGO });
      if (res.value) {
        const parsed = JSON.parse(res.value) as Partial<MetodoPagoStorage> | string;
        if (typeof parsed === 'string') {
          this.metodoSeleccionado = parsed;
        } else {
          this.metodoSeleccionado = parsed.metodoSeleccionado ?? 'efectivo';
          if ('tarjeta' in parsed) {
            this.tarjetaRegistrada = parsed.tarjeta ?? null;
          }
        }
      } else {
        this.metodoSeleccionado = 'efectivo';
        await this.saveMetodoPago();
      }
    } catch (err) {
      console.error('Error al cargar método de pago:', err);
    }

    this.cdr.detectChanges();
  }

  private async saveMetodoPago() {
    const data: MetodoPagoStorage = {
      metodoSeleccionado: this.metodoSeleccionado,
      tarjeta: this.tarjetaRegistrada,
    };

    await Preferences.set({
      key: this.KEY_METODO_PAGO,
      value: JSON.stringify(data),
    });
  }

  public seleccionarTarjeta() {
    if (this.tarjetaRegistrada) {
      this.metodoSeleccionado = 'tarjeta';
      this.cdr.detectChanges();
    }
  }

  public abrirAgregarTarjeta() {
    this.router.navigateByUrl('/agregar-tarjeta');
  }

  public async eliminarTarjeta(event: Event) {
    event.stopPropagation();
    this.tarjetaRegistrada = null;
    if (this.metodoSeleccionado === 'tarjeta') {
      this.metodoSeleccionado = 'efectivo';
    }
    await this.saveMetodoPago();
    this.cdr.detectChanges();
  }

  regresar() {
    this.navCtrl.back();
  }

  async guardar() {
    console.log('Método guardado:', this.metodoSeleccionado, this.tarjetaRegistrada);
    await this.saveMetodoPago();
    this.cdr.detectChanges();
    this.navCtrl.back();
  }
}