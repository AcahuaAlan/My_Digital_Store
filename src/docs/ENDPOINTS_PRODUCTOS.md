# Endpoints de Productos — FakeStoreAPI

URL base: `https://fakestoreapi.com`

## 1. Obtener productos
- **Método:** `GET`
- **Endpoint:** `https://fakestoreapi.com/products`
- **Respuesta (`200 OK`):** Lista de productos en formato JSON (`id`, `title`, `price`, `description`, `category`, `image`).

## 2. Crear producto
- **Método:** `POST`
- **Endpoint:** `https://fakestoreapi.com/products`
- **Body (`application/json`):**
  ```json
  {
    "title": "Coca - Cola",
    "price": 22,
    "description": "Bebida refrescante",
    "category": "Refrescos",
    "image": "[https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg](https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg)"
  }