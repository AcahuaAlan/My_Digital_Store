import { ChangeDetectorRef, Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  searchOutline,
  calendarOutline,
  bagHandleOutline,
  timeOutline,
  cardOutline,
  cashOutline,
  refreshOutline,
} from 'ionicons/icons';
import { Preferences } from '@capacitor/preferences';
import { Producto } from '../../../models/producto.model';

interface PurchaseOrder {
  id: string;
  items: Producto[];
  date: string;
  total: number;
  paymentType: 'card' | 'cash';
  cardLast4?: string;
}

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
  ],
})
export class HistorialPage {
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private navCtrl: NavController = inject(NavController);

  public searchText: string = '';
  public orders: PurchaseOrder[] = [];
  private readonly KEY_HISTORIAL: string = 'ddr_key_historial';
  private readonly KEY_CARRITO: string = 'ddr_key_carrito';

  constructor() {
    addIcons({
      arrowBackOutline,
      searchOutline,
      calendarOutline,
      bagHandleOutline,
      timeOutline,
      cardOutline,
      cashOutline,
      refreshOutline,
    });
  }

  private crearOrdenesIniciales(): PurchaseOrder[] {
    return [
      {
        id: '1',
        items: [
          {
            id: '1-1',
            nombre: 'Coca-Cola 600 ml',
            categoria: 'Bebidas',
            precio: 24.0,
            cantidad: 2,
            imagen: 'assets/coca-cola.png',
          },
          {
            id: '1-2',
            nombre: 'Maruchan 64 g',
            categoria: 'Botanas',
            precio: 18.0,
            cantidad: 2,
            imagen: 'assets/maruchan.png',
          },
          {
            id: '1-3',
            nombre: 'Takis-Fuego 45 g',
            categoria: 'Botanas',
            precio: 20.0,
            cantidad: 1,
            imagen: 'assets/takis-fuego.png',
          },
        ],
        date: '14/10/2026',
        total: 104.0,
        paymentType: 'card',
        cardLast4: '4291',
      },
      {
        id: '2',
        items: [
          {
            id: '2-1',
            nombre: 'Pepsi 600 ml',
            categoria: 'Bebidas',
            precio: 22.0,
            cantidad: 2,
            imagen: 'assets/pepsi.png',
          },
          {
            id: '2-2',
            nombre: 'Takis-Fuego 45 g',
            categoria: 'Botanas',
            precio: 20.0,
            cantidad: 2,
            imagen: 'assets/takis-fuego.png',
          },
          {
            id: '2-3',
            nombre: 'Maruchan 64 g',
            categoria: 'Botanas',
            precio: 18.0,
            cantidad: 1,
            imagen: 'assets/maruchan.png',
          },
        ],
        date: '02/10/2026',
        total: 102.0,
        paymentType: 'cash',
      },
    ];
  }

  private resolverTipoPago(order: any): 'card' | 'cash' {
    if (order?.paymentType === 'cash' || order?.esEfectivo === true || order?.metodo === 'efectivo') {
      return 'cash';
    }
    const textoMetodo = String(order?.metodoPago ?? order?.metodo ?? order?.paymentType ?? '').toLowerCase();
    if (textoMetodo.includes('efectivo') || textoMetodo.includes('cash')) {
      return 'cash';
    }
    return 'card';
  }

  private resolverFecha(order: any): string {
    const fechaDirecta = String(order?.date ?? order?.fecha ?? order?.fechaCorta ?? '').trim();
    if (fechaDirecta) {
      return fechaDirecta.split(',')[0].trim();
    }
    return new Date().toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  private resolverUltimos4(order: any, paymentType: 'card' | 'cash'): string | undefined {
    if (paymentType === 'cash') {
      return undefined;
    }
    const directo = String(order?.cardLast4 ?? order?.ultimos4 ?? '').trim();
    if (directo) {
      return directo;
    }
    const match = String(order?.metodoPago ?? '').match(/(\d{4})$/);
    return match ? match[1] : undefined;
  }

  ionViewWillEnter() {
    Preferences.get({ key: this.KEY_HISTORIAL }).then((res) => {
      if (res.value) {
        const parsed = JSON.parse(res.value);
        if (Array.isArray(parsed)) {
          const tieneProductosAntiguos = parsed.some(
            (order: any) =>
              Array.isArray(order.items) &&
              order.items.some(
                (item: Partial<Producto>) =>
                  item.nombre === 'Barritas' || item.nombre === 'Bimbuñuelos'
              )
          );

          if (tieneProductosAntiguos) {
            this.orders = this.crearOrdenesIniciales();
          } else {
            this.orders = parsed.map(
              (
                order: any,
                orderIdx: number
              ): PurchaseOrder => {
                const paymentType = this.resolverTipoPago(order);
                const rawItems = Array.isArray(order.items)
                  ? order.items
                  : Array.isArray(order.productos)
                    ? order.productos
                    : [];

                return {
                  id: String(order.id ?? `${orderIdx + 1}`),
                  date: this.resolverFecha(order),
                  total: Number(order.total) || 0,
                  paymentType,
                  cardLast4: this.resolverUltimos4(order, paymentType),
                  items: rawItems.map(
                    (
                      item: Partial<Producto> & { name?: string; quantity?: number },
                      itemIdx: number
                    ): Producto => ({
                      id: item.id ?? `${order.id ?? orderIdx + 1}-${itemIdx + 1}`,
                      nombre: item.nombre ?? item.name ?? 'Producto',
                      categoria: item.categoria ?? '',
                      precio: Number(item.precio) || 0,
                      cantidad: Number(item.cantidad ?? item.quantity) || 1,
                      imagen: item.imagen ?? '',
                    })
                  ),
                };
              }
            );
          }
          this.saveOrders();
        } else {
          this.orders = this.crearOrdenesIniciales();
          this.saveOrders();
        }
      } else {
        this.orders = this.crearOrdenesIniciales();
        this.saveOrders();
      }
      this.cdr.detectChanges();
    });
  }

  public goBack() {
    this.navCtrl.back();
  }

  public get filteredOrders(): PurchaseOrder[] {
    const query = this.searchText.trim().toLowerCase();
    if (!query) {
      return this.orders;
    }
    return this.orders.filter(
      (order) =>
        order.date.toLowerCase().includes(query) ||
        order.items.some((item) => item.nombre.toLowerCase().includes(query))
    );
  }

  public async repeatOrder(order: PurchaseOrder) {
    const itemsParaCarrito: Producto[] = order.items.map((item, index) => ({
      id: item.id ?? `${order.id}-${index}`,
      nombre: item.nombre,
      categoria: item.categoria ?? '',
      precio: Number(item.precio) || 0,
      cantidad: Number(item.cantidad) || 1,
      imagen: item.imagen ?? '',
    }));

    await Preferences.set({
      key: this.KEY_CARRITO,
      value: JSON.stringify(itemsParaCarrito),
    });

    this.navCtrl.navigateForward('/tabs/carrito');
  }

  private saveOrders() {
    Preferences.set({
      key: this.KEY_HISTORIAL,
      value: JSON.stringify(this.orders),
    });
  }
}