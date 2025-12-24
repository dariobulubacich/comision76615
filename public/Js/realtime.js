const socket = io();

socket.on("updateProducts", (products) => {
  console.log(products);
});
