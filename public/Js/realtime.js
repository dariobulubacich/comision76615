const socket = io();

const list = document.getElementById("productList");

// Nuevo producto agregado
socket.on("productAdded", (product) => {
  const li = document.createElement("li");
  li.id = `prod-${product.id}`;
  li.innerHTML = `<strong>${product.title}</strong> - $${product.price}`;
  list.appendChild(li);
});

// Producto eliminado
socket.on("productDeleted", (id) => {
  const item = document.getElementById(`prod-${id}`);
  if (item) item.remove();
});
