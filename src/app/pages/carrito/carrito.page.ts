import { ChangeDetectorRef, Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon, NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  personOutline,
  storefrontOutline,
  pencilOutline,
  removeOutline,
  addOutline,
  trashOutline,
  cardOutline,
  cashOutline,
  checkmarkSharp,
  lockClosedOutline,
  closeOutline,
} from 'ionicons/icons';
import { Preferences } from '@capacitor/preferences';
import { Producto } from '../../models/producto.model';

interface TarjetaGuardada {
  marca?: string;
  nombre?: string;
  ultimos4?: string;
}

interface MetodoPagoStorage {
  metodoSeleccionado?: string;
  tarjeta?: TarjetaGuardada | null;
}

interface UsuarioStorage {
  username?: string;
  usuario?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  direccion?: string | {
    calle?: string;
    address?: string;
    colonia?: string;
    neighborhood?: string;
    ciudad?: string;
    city?: string;
  };
}

interface OrdenHistorial {
  id: string;
  fecha: string;
  fechaCorta?: string;
  metodoPago: string;
  metodo?: 'efectivo' | 'tarjeta';
  esEfectivo?: boolean;
  ultimos4?: string;
  direccionEntrega: string;
  total: number;
  productos: Producto[];
  items: Producto[];
}

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule, IonContent, IonIcon],
})
export class CarritoPage {
  private navCtrl: NavController = inject(NavController);
  private router: Router = inject(Router);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  public metodoPagoSeleccionado: string = 'efectivo';
  public tieneTarjetaRegistrada: boolean = false;
  public etiquetaTarjeta: string = 'Sin tarjeta registrada';
  public direccionPrincipal: string = 'Sin dirección registrada';
  public direccionSecundaria: string = 'Agrega tu dirección de entrega';
  public productos: Producto[] = [];
  public mostrarConfirmacion: boolean = false;

  private readonly KEY_CARRITO: string = 'ddr_key_carrito';
  private readonly KEY_HISTORIAL: string = 'ddr_key_historial';
  private readonly KEY_METODO_PAGO: string = 'ddr_key_metodo_pago';
  private readonly KEY_DIRECCION: string = 'ddr_key_direccion';
  private readonly KEY_PERFIL: string = 'ddr_key_perfil';
  private readonly KEY_SESSION: string = 'ddr_key_session';
  private readonly KEY_USERS: string = 'ddr_key_users';

  constructor() {
    addIcons({
      arrowBackOutline,
      personOutline,
      storefrontOutline,
      pencilOutline,
      removeOutline,
      addOutline,
      trashOutline,
      cardOutline,
      cashOutline,
      checkmarkSharp,
      lockClosedOutline,
      closeOutline,
    });
  }

  async ionViewWillEnter() {
    await this.cargarMetodoPago();
    await this.cargarDireccionUsuario();

    const res = await Preferences.get({ key: this.KEY_CARRITO });
    if (res.value !== null) {
      const parsed = JSON.parse(res.value);
      if (Array.isArray(parsed)) {
        this.productos = parsed.map((p: Partial<Producto>, idx: number): Producto => ({
          id: p.id ?? idx + 1,
          nombre: p.nombre ?? 'Producto',
          categoria: p.categoria ?? '',
          precio: Number(p.precio) || 0,
          cantidad: Number(p.cantidad) || 1,
          imagen: p.imagen || 'assets/pepsi.png',
        }));
      } else {
        this.productos = [];
      }
    } else {
      this.setDefaultProductos();
    }

    this.cdr.detectChanges();
  }

  private async cargarMetodoPago() {
    try {
      const res = await Preferences.get({ key: this.KEY_METODO_PAGO });
      if (!res.value) {
        this.tieneTarjetaRegistrada = false;
        this.etiquetaTarjeta = 'Sin tarjeta registrada';
        this.metodoPagoSeleccionado = 'efectivo';
        return;
      }

      const parsed = JSON.parse(res.value) as MetodoPagoStorage | string;
      if (typeof parsed === 'string') {
        this.tieneTarjetaRegistrada = false;
        this.etiquetaTarjeta = 'Sin tarjeta registrada';
        this.metodoPagoSeleccionado = 'efectivo';
        return;
      }

      const ultimos4 = String(parsed.tarjeta?.ultimos4 ?? '').trim();
      if (ultimos4) {
        this.tieneTarjetaRegistrada = true;
        const nombreTarjeta = parsed.tarjeta?.nombre || 'Tarjeta';
        this.etiquetaTarjeta = `${nombreTarjeta} terminada en **** ${ultimos4}`;
      } else {
        this.tieneTarjetaRegistrada = false;
        this.etiquetaTarjeta = 'Sin tarjeta registrada';
      }

      if (parsed.metodoSeleccionado === 'tarjeta' && this.tieneTarjetaRegistrada) {
        this.metodoPagoSeleccionado = 'tarjeta';
      } else {
        this.metodoPagoSeleccionado = 'efectivo';
        if (parsed.metodoSeleccionado === 'tarjeta') {
          await Preferences.set({
            key: this.KEY_METODO_PAGO,
            value: JSON.stringify({
              ...parsed,
              metodoSeleccionado: 'efectivo',
              tarjeta: parsed.tarjeta ?? null,
            }),
          });
        }
      }
    } catch (err) {
      console.error('Error al cargar método de pago en carrito:', err);
      this.tieneTarjetaRegistrada = false;
      this.etiquetaTarjeta = 'Sin tarjeta registrada';
      this.metodoPagoSeleccionado = 'efectivo';
    }
  }

  private extraerDireccionDeUsuario(obj: any): { principal?: string; secundaria?: string } {
    if (!obj || typeof obj !== 'object') {
      return {};
    }

    const dirNested =
      obj.direccion && typeof obj.direccion === 'object' ? obj.direccion : {};

    const principal = String(
      obj.address ??
      dirNested.address ??
      dirNested.calle ??
      (typeof obj.direccion === 'string' ? obj.direccion : '') ??
      ''
    ).trim();

    const colonia = String(
      obj.neighborhood ??
      dirNested.neighborhood ??
      dirNested.colonia ??
      ''
    ).trim();

    const ciudad = String(
      obj.city ??
      dirNested.city ??
      dirNested.ciudad ??
      ''
    ).trim();

    const secundaria = [colonia, ciudad].filter(Boolean).join(', ').trim();

    return {
      principal: principal || undefined,
      secundaria: secundaria || undefined,
    };
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
            const extraida = this.extraerDireccionDeUsuario(usuarioEncontrado);
            if (extraida.principal || extraida.secundaria) {
              this.direccionPrincipal = extraida.principal || 'Sin dirección registrada';
              this.direccionSecundaria = extraida.secundaria || '';
              return;
            }
          }
        }
      }

      if (sesionParsed) {
        const extraidaSesion = this.extraerDireccionDeUsuario(sesionParsed);
        if (extraidaSesion.principal || extraidaSesion.secundaria) {
          this.direccionPrincipal = extraidaSesion.principal || 'Sin dirección registrada';
          this.direccionSecundaria = extraidaSesion.secundaria || '';
          return;
        }
      }

      const perfilRes = await Preferences.get({ key: this.KEY_PERFIL });
      if (perfilRes.value) {
        const parsedPerfil = JSON.parse(perfilRes.value);
        const extraidaPerfil = this.extraerDireccionDeUsuario(parsedPerfil);
        if (extraidaPerfil.principal || extraidaPerfil.secundaria) {
          this.direccionPrincipal = extraidaPerfil.principal || 'Sin dirección registrada';
          this.direccionSecundaria = extraidaPerfil.secundaria || '';
          return;
        }
      }

      const dirRes = await Preferences.get({ key: this.KEY_DIRECCION });
      if (dirRes.value) {
        const parsedDir = JSON.parse(dirRes.value);
        if (typeof parsedDir === 'string' && parsedDir.trim()) {
          this.direccionPrincipal = parsedDir.trim();
          this.direccionSecundaria = '';
          return;
        }
        const extraidaDir = this.extraerDireccionDeUsuario(parsedDir);
        if (extraidaDir.principal || extraidaDir.secundaria) {
          this.direccionPrincipal = extraidaDir.principal || 'Sin dirección registrada';
          this.direccionSecundaria = extraidaDir.secundaria || '';
          return;
        }
      }

      this.direccionPrincipal = 'Sin dirección registrada';
      this.direccionSecundaria = 'Agrega tu dirección de entrega';
    } catch (err) {
      console.error('Error al cargar dirección del usuario:', err);
    }
  }

  private setDefaultProductos() {
    this.productos = [
    ];
    this.saveCarrito();
  }

  private saveCarrito() {
    Preferences.set({
      key: this.KEY_CARRITO,
      value: JSON.stringify(this.productos),
    });
  }

  regresar() {
    this.router.navigateByUrl('/tabs/tienda');
  }

  irADireccion() {
    this.router.navigateByUrl('/direccion');
  }

  incrementarCantidad(producto: Producto) {
    producto.cantidad++;
    this.saveCarrito();
  }

  decrementarCantidad(producto: Producto) {
    if (producto.cantidad > 1) {
      producto.cantidad--;
      this.saveCarrito();
    }
  }

  eliminarProducto(index: number) {
    this.productos.splice(index, 1);
    this.saveCarrito();
  }

  vaciarCarrito() {
    this.productos = [];
    this.saveCarrito();
  }

  async seleccionarMetodo(metodo: string) {
    if (metodo === 'tarjeta' && !this.tieneTarjetaRegistrada) {
      this.metodoPagoSeleccionado = 'efectivo';
      this.cdr.detectChanges();
      return;
    }

    this.metodoPagoSeleccionado = metodo;
    try {
      const res = await Preferences.get({ key: this.KEY_METODO_PAGO });
      const actual: MetodoPagoStorage = res.value ? JSON.parse(res.value) : {};
      await Preferences.set({
        key: this.KEY_METODO_PAGO,
        value: JSON.stringify({
          ...actual,
          metodoSeleccionado: metodo,
        }),
      });
    } catch (err) {
      console.error('Error al guardar método de pago:', err);
    }
    this.cdr.detectChanges();
  }

  obtenerTotal(): number {
    return this.productos.reduce(
      (acc, prod) => acc + (Number(prod.precio) || 0) * (Number(prod.cantidad) || 0),
      0
    );
  }

  abrirConfirmacion() {
    if (!this.productos.length) {
      return;
    }
    this.mostrarConfirmacion = true;
  }

  cerrarConfirmacion() {
    this.mostrarConfirmacion = false;
  }

  async confirmarPedido() {
    if (!this.productos.length) {
      this.mostrarConfirmacion = false;
      return;
    }

    try {
      const totalOrden = this.obtenerTotal();
      const copiaProductos = this.productos.map((p) => ({ ...p }));
      const esEfectivo = !(this.metodoPagoSeleccionado === 'tarjeta' && this.tieneTarjetaRegistrada);
      const metodoTexto = esEfectivo
        ? 'Efectivo contra entrega'
        : this.etiquetaTarjeta;

      const ahora = new Date();
      const fechaFormateada = ahora.toLocaleString('es-MX');
      const fechaCortaFormateada = ahora.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      const matchUltimos4 = this.etiquetaTarjeta.match(/(\d{4})$/);
      const ultimos4Extraidos = !esEfectivo && matchUltimos4 ? matchUltimos4[1] : '';

      const direccionCompleta = [this.direccionPrincipal, this.direccionSecundaria]
        .filter(Boolean)
        .join(', ');

      const nuevaOrden: OrdenHistorial = {
        id: `ORD-${Date.now()}`,
        fecha: fechaFormateada,
        fechaCorta: fechaCortaFormateada,
        metodoPago: metodoTexto,
        metodo: esEfectivo ? 'efectivo' : 'tarjeta',
        esEfectivo,
        ultimos4: ultimos4Extraidos,
        direccionEntrega: direccionCompleta,
        total: totalOrden,
        productos: copiaProductos,
        items: copiaProductos,
      };

      const histRes = await Preferences.get({ key: this.KEY_HISTORIAL });
      let historialActual: OrdenHistorial[] = [];

      if (histRes.value) {
        const parsedHist = JSON.parse(histRes.value);
        if (Array.isArray(parsedHist)) {
          historialActual = parsedHist;
        }
      }

      const historialActualizado = [nuevaOrden, ...historialActual];
      await Preferences.set({
        key: this.KEY_HISTORIAL,
        value: JSON.stringify(historialActualizado),
      });

      this.mostrarConfirmacion = false;
      this.productos = [];
      await Preferences.set({
        key: this.KEY_CARRITO,
        value: JSON.stringify([]),
      });

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al guardar el pedido en el historial:', error);
      this.mostrarConfirmacion = false;
      this.cdr.detectChanges();
    }
  }
}