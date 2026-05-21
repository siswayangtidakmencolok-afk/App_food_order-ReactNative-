/** Normalisasi baris `orders` + relasi `order_items` ke bentuk yang dipakai UI */
export const formatOrderRow = (o) => ({
  ...o,
  orderNumber:       o.order_number,
  customerName:      o.customer_name,
  phoneNumber:       o.phone_number,
  deliveryAddress:   o.delivery_address,
  orderNotes:        o.order_notes,
  paymentMethod:     o.payment_method,
  estimatedDelivery: o.estimated_delivery,
  paymentStatus:     o.payment_status ?? 'unpaid',
  midtransOrderId:   o.midtrans_order_id,
  items: (o.order_items || o.items || []).map((item) => ({
    ...item,
    id: item.menu_item_id ?? item.id,
  })),
  createdAt: o.created_at ?? o.createdAt,
});
