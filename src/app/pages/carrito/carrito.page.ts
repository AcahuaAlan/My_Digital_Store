import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular';
import { NavController } from '@ionic/angular';
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
  lockClosedOutline 
} from 'ionicons/icons';

interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  cantidad: number;
  imagen: string;
}

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule, IonContent, IonIcon]
})
export class CarritoPage implements OnInit {

  metodoPagoSeleccionado: string = 'tarjeta';

  productos: Producto[] = [
    {
      id: 1,
      nombre: 'Pepsi 600 ml',
      categoria: 'Bebidas no alcohólicas',
      precio: 24.00,
      cantidad: 1,
      imagen: 'assets/pepsi.png'
    },
    {
      id: 2,
      nombre: 'Takis-Fuego 45 g',
      categoria: 'Botana de maíz picante',
      precio: 20.00,
      cantidad: 1,
      imagen: 'assets/takis-fuego.png'
    }
  ];

  constructor(private navCtrl: NavController) {
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
      lockClosedOutline
    });
  }

  ngOnInit() { }

  regresar() {
    this.navCtrl.back();
  }

  incrementarCantidad(producto: Producto) {
    producto.cantidad++;
  }

  decrementarCantidad(producto: Producto) {
    if (producto.cantidad > 1) {
      producto.cantidad--;
    }
  }

  eliminarProducto(index: number) {
    this.productos.splice(index, 1);
  }

  vaciarCarrito() {
    this.productos = [];
  }

  seleccionarMetodo(metodo: string) {
    this.metodoPagoSeleccionado = metodo;
  }

  obtenerTotal(): number {
    return this.productos.reduce((acc, prod) => acc + (prod.precio * prod.cantidad), 0);
  }
}