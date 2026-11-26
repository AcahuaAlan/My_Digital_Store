import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/angular';
import { ProductosService, ProductoPayload } from '../../services/productos';
import { Producto } from '../../models/producto.model';

@Component({
  selector: 'app-gestion-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonHeader, IonToolbar, IonTitle],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>CRUD de Productos</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (errorMsg) {
        <div style="color: #9b1c1c; background: #fde8e8; padding: 10px; border-radius: 8px; margin-bottom: 12px;">
          {{ errorMsg }}
        </div>
      }

      @if (infoMsg) {
        <div style="color: #166534; background: #dcfce7; padding: 10px; border-radius: 8px; margin-bottom: 12px;">
          {{ infoMsg }}
        </div>
      }

      <form (ngSubmit)="guardar()" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
        <input
          type="text"
          [(ngModel)]="form.nombre"
          name="nombre"
          placeholder="Nombre del producto"
        />
        <input
          type="number"
          [(ngModel)]="form.precio"
          name="precio"
          placeholder="Precio"
        />
        <input
          type="text"
          [(ngModel)]="form.categoria"
          name="categoria"
          placeholder="Categoría"
        />

        <div style="display: flex; gap: 8px;">
          <button type="submit" [disabled]="guardando">
            {{ guardando ? 'Enviando...' : (editandoId !== null ? 'Actualizar (PUT)' : 'Crear (POST)') }}
          </button>

          @if (editandoId !== null) {
            <button type="button" (click)="cancelarEdicion()" [disabled]="guardando">
              Cancelar
            </button>
          }
        </div>
      </form>

      @if (cargando) {
        <p>Cargando productos...</p>
      } @else if (productos.length === 0) {
        <p>No hay productos registrados.</p>
      } @else {
        <div style="display: flex; flex-direction: column; gap: 10px;">
          @for (prod of productos; track prod.id) {
            <div style="border: 1px solid #d6d3d1; border-radius: 10px; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong>{{ prod.nombre }}</strong>
                <div>\${{ prod.precio }} — {{ prod.categoria }}</div>
              </div>

              <div style="display: flex; gap: 6px;">
                <button type="button" (click)="editar(prod)">Editar</button>
                <button type="button" (click)="borrar(prod.id)">Eliminar</button>
              </div>
            </div>
          }
        </div>
      }
    </ion-content>
  `,
})
export class GestionProductosPage {
  private productosService: ProductosService = inject(ProductosService);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  public productos: Producto[] = [];
  public form: ProductoPayload = { nombre: '', precio: 0, categoria: '' };
  public editandoId: number | string | null = null;

  public cargando = false;
  public guardando = false;
  public errorMsg = '';
  public infoMsg = '';

  ionViewWillEnter() {
    this.cargarProductos();
  }

  async cargarProductos() {
    this.cargando = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    try {
      this.productos = await this.productosService.getProductos();
    } catch (err: any) {
      this.errorMsg = err?.message || 'Error al cargar los productos.';
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  private validarAntesDeEnviar(): boolean {
    this.errorMsg = '';
    const nombre = (this.form.nombre || '').trim();
    const categoria = (this.form.categoria || '').trim();
    const precio = Number(this.form.precio);

    if (!nombre) {
      this.errorMsg = 'El nombre del producto es obligatorio.';
      return false;
    }
    if (isNaN(precio) || precio <= 0) {
      this.errorMsg = 'El precio debe ser un número mayor a 0.';
      return false;
    }
    if (!categoria) {
      this.errorMsg = 'La categoría es obligatoria.';
      return false;
    }
    return true;
  }

  async guardar() {
    if (!this.validarAntesDeEnviar()) {
      this.cdr.detectChanges();
      return;
    }

    this.guardando = true;
    this.errorMsg = '';
    this.infoMsg = '';
    this.cdr.detectChanges();

    const payload: ProductoPayload = {
      nombre: this.form.nombre.trim(),
      precio: Number(this.form.precio),
      categoria: this.form.categoria.trim(),
      cantidad: 1,
    };

    try {
      if (this.editandoId !== null) {
        const actualizado = await this.productosService.actualizarProducto(this.editandoId, payload);
        this.productos = this.productos.map((p) => (p.id === this.editandoId ? actualizado : p));
        this.infoMsg = 'Producto actualizado correctamente.';
      } else {
        const creado = await this.productosService.crearProducto(payload);
        this.productos = [creado, ...this.productos];
        this.infoMsg = 'Producto creado correctamente.';
      }
      this.cancelarEdicion();
    } catch (err: any) {
      this.errorMsg = err?.message || 'Error al guardar el producto.';
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  editar(prod: Producto) {
    this.editandoId = prod.id;
    this.form = {
      nombre: prod.nombre,
      precio: prod.precio,
      categoria: prod.categoria,
      cantidad: prod.cantidad,
      imagen: prod.imagen,
    };
    this.errorMsg = '';
    this.infoMsg = '';
  }

  cancelarEdicion() {
    this.editandoId = null;
    this.form = { nombre: '', precio: 0, categoria: '' };
  }

  async borrar(id: number | string) {
    this.cargando = true;
    this.errorMsg = '';
    this.infoMsg = '';
    this.cdr.detectChanges();

    try {
      await this.productosService.eliminarProducto(id);
      this.productos = this.productos.filter((p) => p.id !== id);
      this.infoMsg = 'Producto eliminado correctamente.';
    } catch (err: any) {
      this.errorMsg = err?.message || 'Error al eliminar el producto.';
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }
}