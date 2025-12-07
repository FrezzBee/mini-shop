# Сутності домену Mini Shop

## Піддомени
1. Catalog (Каталог товарів)
2. Orders (Замовлення)
3. Payments (Оплати)

## Ключові сутності

### Catalog
- Product
  - id: number
  - name: string
  - price: number

### Orders
- Order
  - id: number
  - items: array of OrderItem
  - total: number
- OrderItem
  - productId: number
  - quantity: number

### Payments
- Payment
  - id: number
  - orderId: number
  - amount: number
  - status: string
