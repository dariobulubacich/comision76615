# Entrega - API Productos y Carritos

Servidor Node.js + Express que expone endpoints para productos y carritos.

## Instalar

npm install

## Ejecutar

npm run dev

# o para desarrollo

npm run dev

## Endpoints principales

- GET /api/products
- GET /api/products/:pid
- POST /api/products
- PUT /api/products/:pid
- DELETE /api/products/:pid

- POST /api/carts
- GET /api/carts/:cid
- POST /api/carts/:cid/product/:pid

Los datos se persisten en `data/products.json` y `data/carts.json`.
