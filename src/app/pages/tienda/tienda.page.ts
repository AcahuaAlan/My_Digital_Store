import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonGrid, 
  IonRow, 
  IonCol, 
  IonButton, 
  IonIcon 
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  locationOutline, 
  location, 
  searchOutline, 
  personCircleOutline, 
  chevronDownOutline,
  closeCircleOutline
} from 'ionicons/icons';
import { Preferences } from '@capacitor/preferences';
import { Producto } from '../../models/producto.model';
import { ProductosService } from '../../services/productos';

interface UsuarioStorage {
  username?: string;
  usuario?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
}

@Component({
  selector: 'app-tienda',
  templateUrl: './tienda.page.html',
  styleUrls: ['./tienda.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonContent, 
    IonGrid, 
    IonRow, 
    IonCol, 
    IonButton, 
    IonIcon
  ]
})
export class TiendaPage {
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private router: Router = inject(Router);
  private productosService: ProductosService = inject(ProductosService);

  public storeData: Record<string, unknown> = {};
  public direccionEntrega: string = 'Sin dirección registrada';
  public textoBusqueda: string = '';
  public categoriaSeleccionada: string = 'Todos';
  public categorias: string[] = [
    'Todos',
    'Bebidas',
    'Botanas',
    'Panadería',
    'Galleta',
    'Lácteos',
    'Enlatados',
    'Abarrotes'
  ];

  public productos: Producto[] = [
    {
      id: 1,
      nombre: 'Coca-Cola 600 ml',
      categoria: 'Bebidas',
      precio: 24.0,
      cantidad: 1,
      imagen: 'assets/coca-cola.png'
    },
    {
      id: 2,
      nombre: 'Takis-Fuego 45 g',
      categoria: 'Botanas',
      precio: 20.0,
      cantidad: 1,
      imagen: 'assets/takis-fuego.png'
    },
    {
      id: 3,
      nombre: 'Pepsi 600 ml',
      categoria: 'Bebidas',
      precio: 23.0,
      cantidad: 1,
      imagen: 'assets/pepsi.png'
    },
    {
      id: 4,
      nombre: 'Maruchan 64 g',
      categoria: 'Botanas',
      precio: 18.0,
      cantidad: 1,
      imagen: 'assets/maruchan.png'
    },
    {
      id: 5,
      nombre: 'Bimbuñuelos 99 g',
      categoria: 'Panadería',
      precio: 26.0,
      cantidad: 1,
      imagen: 'assets/Bimbuñuelos.jpg'
    },
    {
      id: 6,
      nombre: 'Pan Blanco Grande 620 g',
      categoria: 'Panadería',
      precio: 50.0,
      cantidad: 1,
      imagen: 'assets/PanBimbo.jpg'
    },
    {
      id: 7,
      nombre: 'Ruffles Queso 48 g',
      categoria: 'Botanas',
      precio: 45.0,
      cantidad: 1,
      imagen: 'assets/Ruffles.jpg'
    },
    {
      id: 8,
      nombre: 'Cheetos Torciditos 48 g',
      categoria: 'Botanas',
      precio: 42.0,
      cantidad: 1,
      imagen: 'assets/Cheetos.jpg'
    },
    {
      id: 9,
      nombre: 'Doritos Nacho 54 g',
      categoria: 'Botanas',
      precio: 22.0,
      cantidad: 1,
      imagen: 'assets/Doritos.jpg'
    },
    {
      id: 10,
      nombre: 'Papas Saladas 45 g',
      categoria: 'Botanas',
      precio: 22.0,
      cantidad: 1,
      imagen: 'assets/Sabritas.jpg'
    },
    {
      id: 11,
      nombre: 'Sprite 600 ml',
      categoria: 'Bebidas',
      precio: 23.0,
      cantidad: 1,
      imagen: 'assets/Sprite.jpg'
    },
    {
      id: 12,
      nombre: 'Agua Purificada 1 L',
      categoria: 'Bebidas',
      precio: 16.0,
      cantidad: 1,
      imagen: 'assets/AguaCiel.jpg'
    },
    {
      id: 13,
      nombre: 'Jugo de Mango 500 ml',
      categoria: 'Bebidas',
      precio: 20.0,
      cantidad: 1,
      imagen: 'assets/Boing.jpg'
    },
    {
      id: 14,
      nombre: 'Nito 62 g',
      categoria: 'Panadería',
      precio: 20.0,
      cantidad: 1,
      imagen: 'assets/Nito.jpg'
    },
    {
      id: 15,
      nombre: 'Galletas Emperador 121 g',
      categoria: 'Galleta',
      precio: 22.0,
      cantidad: 1,
      imagen: 'assets/Emperador.jpg'
    },
    {
      id: 16,
      nombre: 'Leche Entera 1 L',
      categoria: 'Lácteos',
      precio: 32.0,
      cantidad: 1,
      imagen: 'assets/LecheEntera.jpg'
    },
    {
      id: 17,
      nombre: 'Frijoles Refritos 580 g',
      categoria: 'Enlatados',
      precio: 20.0,
      cantidad: 1,
      imagen: 'assets/FrijolesRefritos.jpg'
    },
    {
      id: 18,
      nombre: 'Chiles Jalapeños',
      categoria: 'Enlatados',
      precio: 19.0,
      cantidad: 1,
      imagen: 'assets/ChilesJalapeños.jpg'
    },
    {
      id: 19,
      nombre: 'Atún en Agua',
      categoria: 'Enlatados',
      precio: 24.0,
      cantidad: 1,
      imagen: 'assets/AtunEnAgua.jpg'
    },
    {
      id: 20,
      nombre: 'Huevo Fresco 12 pzas',
      categoria: 'Abarrotes',
      precio: 56.0,
      cantidad: 1,
      imagen: 'assets/HuevoFresco.jpg'
    }
  ];

  public cargandoProductos: boolean = false;
  public errorProductos: string = '';

  private readonly KEY_TIENDA: string = 'ddr_key_tienda';
  private readonly KEY_CARRITO: string = 'ddr_key_carrito';
  private readonly KEY_USERS: string = 'ddr_key_users';
  private readonly KEY_SESSION: string = 'ddr_key_session';
  private readonly KEY_DIRECCION: string = 'ddr_key_direccion';

  constructor() {
    addIcons({
      locationOutline,
      location,
      searchOutline,
      personCircleOutline,
      chevronDownOutline,
      closeCircleOutline
    });
  }

  public get productosFiltrados(): Producto[] {
    const termino = this.textoBusqueda.trim().toLowerCase();
    const categoriaActiva = this.categoriaSeleccionada.trim().toLowerCase();

    return this.productos.filter((prod) => {
      const catProd = (prod.categoria ?? '').trim().toLowerCase();
      const coincideCategoria =
        categoriaActiva === 'todos' || catProd === categoriaActiva;

      if (!coincideCategoria) {
        return false;
      }

      if (!termino) {
        return true;
      }

      const nombre = (prod.nombre ?? '').toLowerCase();
      const precioStr = String(prod.precio ?? '');
      return (
        nombre.includes(termino) ||
        catProd.includes(termino) ||
        precioStr.includes(termino)
      );
    });
  }

  public seleccionarCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    this.cdr.detectChanges();
  }

  public limpiarBusqueda() {
    this.textoBusqueda = '';
    this.categoriaSeleccionada = 'Todos';
    this.cdr.detectChanges();
  }

  async ionViewWillEnter() {
    const res = await Preferences.get({ key: this.KEY_TIENDA });
    if (res.value) {
      this.storeData = JSON.parse(res.value) as Record<string, unknown>;
    } else {
      this.storeData = {};
      this.saveStoreData();
    }

    await this.cargarDireccionUsuario();
    this.cdr.detectChanges();
    this.cargarProductosApi();
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

  private formatearDireccion(obj: any): string {
    if (!obj || typeof obj !== 'object') {
      return '';
    }
    const calle = String(obj.address ?? obj.calle ?? '').trim();
    const colonia = String(obj.neighborhood ?? obj.colonia ?? '').trim();
    const ciudad = String(obj.city ?? obj.ciudad ?? '').trim();
    return [calle, colonia, ciudad].filter(Boolean).join(', ').trim();
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
            const dirUsuario = this.formatearDireccion(usuarioEncontrado);
            if (dirUsuario) {
              this.direccionEntrega = dirUsuario;
              return;
            }
          }
        }
      }

      if (sesionParsed) {
        const dirSesion = this.formatearDireccion(sesionParsed);
        if (dirSesion) {
          this.direccionEntrega = dirSesion;
          return;
        }
      }

      const dirRes = await Preferences.get({ key: this.KEY_DIRECCION });
      if (dirRes.value) {
        const parsedDir = JSON.parse(dirRes.value);
        if (typeof parsedDir === 'string' && parsedDir.trim()) {
          this.direccionEntrega = parsedDir.trim();
          return;
        }
        const dirGuardada = this.formatearDireccion(parsedDir);
        if (dirGuardada) {
          this.direccionEntrega = dirGuardada;
          return;
        }
      }

      this.direccionEntrega = 'Sin dirección registrada';
    } catch (err) {
      console.error('Error al cargar dirección en tienda:', err);
    }
  }

  public irADireccion() {
    this.router.navigateByUrl('/direccion');
  }

  private async cargarProductosApi() {
    this.cargandoProductos = true;
    this.errorProductos = '';

    try {
      await this.productosService.getProductos();
    } catch (error) {
      console.error('Error al obtener productos desde FakeStore API:', error);
    } finally {
      this.cargandoProductos = false;
      this.cdr.detectChanges();
    }
  }

  public agregarAlCarrito(producto: Producto) {
    Preferences.get({ key: this.KEY_CARRITO }).then((res) => {
      let carrito: Producto[] = [];
      if (res.value) {
        const parsed = JSON.parse(res.value);
        if (Array.isArray(parsed)) {
          carrito = parsed as Producto[];
        }
      }

      const existente = carrito.find(
        (item: Producto) => item.id === producto.id || item.nombre === producto.nombre
      );

      if (existente) {
        existente.cantidad = (Number(existente.cantidad) || 0) + 1;
      } else {
        carrito.push({
          ...producto,
          cantidad: Number(producto.cantidad) || 1
        });
      }

      Preferences.set({
        key: this.KEY_CARRITO,
        value: JSON.stringify(carrito),
      }).then(() => {
        this.router.navigateByUrl('/tabs/carrito');
      });
    });
  }

  private saveStoreData() {
    Preferences.set({
      key: this.KEY_TIENDA,
      value: JSON.stringify(this.storeData),
    });
  }
}