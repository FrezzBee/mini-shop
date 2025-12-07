// domain/models.js

class Product {
  constructor(id, name, price) {
    this.id = id;
    this.name = name;
    this.price = price;
  }
}

class OrderItem {
  constructor(productId, quantity) {
    this.productId = productId;
    this.quantity = quantity;
  }
}

class Order {
  constructor(id) {
    this.id = id;
    this.items = [];
    this.total = 0;
  }

  addItem(product, quantity) {
    this.items.push(new OrderItem(product.id, quantity));
    this.total += product.price * quantity;
  }
}

class Payment {
  constructor(id, orderId, amount) {
    this.id = id;
    this.orderId = orderId;
    this.amount = amount;
    this.status = "pending";
  }

  markPaid() {
    this.status = "paid";
  }
}

module.exports = { Product, Order, OrderItem, Payment };
