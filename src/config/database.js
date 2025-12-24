const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/miTienda", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = mongoose;
