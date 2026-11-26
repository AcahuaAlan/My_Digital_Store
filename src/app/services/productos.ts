import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Producto } from '../models/producto.model';

interface FakeStoreItem {
  id?: number;
  title?: string;
  price?: number;
  description?: string;
  category?: string;
  image?: string;
}

export interface ProductoPayload {
  nombre: string;
  precio: number;
  categoria: string;
  cantidad?: number;
  imagen?: string;
  descripcion?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  private readonly API_URL = 'https://fakestoreapi.com/products';
  private readonly KEY_TOKEN = 'ddr_key_token';

  private async getHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    try {
      const res = await Preferences.get({ key: this.KEY_TOKEN });
      if (res.value) {
        let token = '';
        try {
          const parsed = JSON.parse(res.value);
          token = typeof parsed === 'string' ? parsed : (parsed?.token ?? '');
        } catch {
          token = res.value;
        }
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
    } catch {
      // Continúa sin token si no hay sesión/token guardado
    }

    return headers;
  }

  private mapToProducto(item: FakeStoreItem, fallback?: ProductoPayload): Producto {
    return {
      id: item.id ?? Date.now(),
      nombre: item.title ?? fallback?.nombre ?? 'Producto',
      categoria: item.category ?? fallback?.categoria ?? 'General',
      precio: Number(item.price ?? fallback?.precio ?? 0),
      cantidad: Number(fallback?.cantidad ?? 1),
      imagen: item.image ?? fallback?.imagen ?? 'assets/pepsi.png',
    };
  }

  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const authHeaders = await this.getHeaders();
    let response: Response;

    try {
      response = await fetch(url, {
        ...options,
        headers: {
          ...authHeaders,
          ...(options.headers || {}),
        },
      });
    } catch {
      throw new Error('No se pudo conectar con la API. Revisa tu conexión.');
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('No autorizado: revisa el token de acceso.');
      }
      if (response.status === 404) {
        throw new Error('Recurso no encontrado en la API.');
      }
      throw new Error(`Error HTTP: ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const rawText = await response.text();
    if (!rawText.trim()) {
      return undefined as T;
    }

    try {
      return JSON.parse(rawText) as T;
    } catch {
      throw new Error('La respuesta de la API no tiene formato JSON válido.');
    }
  }

  // GET
  async getProductos(): Promise<Producto[]> {
    const data = await this.request<FakeStoreItem[]>(this.API_URL, { method: 'GET' });
    return Array.isArray(data) ? data.map((item) => this.mapToProducto(item)) : [];
  }

  // POST
  async crearProducto(payload: ProductoPayload): Promise<Producto> {
    const data = await this.request<FakeStoreItem>(this.API_URL, {
      method: 'POST',
      body: JSON.stringify({
        title: payload.nombre,
        price: payload.precio,
        category: payload.categoria,
        description: payload.descripcion || payload.nombre,
        image: payload.imagen || 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
      }),
    });

    return this.mapToProducto(data, payload);
  }

  // PUT
  async actualizarProducto(id: number | string, payload: ProductoPayload): Promise<Producto> {
    const data = await this.request<FakeStoreItem>(`${this.API_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: payload.nombre,
        price: payload.precio,
        category: payload.categoria,
        description: payload.descripcion || payload.nombre,
        image: payload.imagen || 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
      }),
    });

    return {
      ...this.mapToProducto(data, payload),
      id,
    };
  }

  // DELETE
  async eliminarProducto(id: number | string): Promise<void> {
    await this.request<unknown>(`${this.API_URL}/${id}`, {
      method: 'DELETE',
    });
  }
}