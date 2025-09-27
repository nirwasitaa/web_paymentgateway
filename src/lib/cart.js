export function readCart() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('cart') || '[]'); }
  catch { return []; }
}
export function writeCart(cart) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('cart', JSON.stringify(cart));
}
export function addToCart(id) {
  const cart = readCart();
  const idx = cart.findIndex(r => r.id === id);
  if (idx === -1) cart.push({ id, qty: 1 });
  else cart[idx].qty += 1;
  writeCart(cart);
}
export function setQty(id, qty) {
  const cart = readCart();
  const idx = cart.findIndex(r => r.id === id);
  if (idx !== -1) {
    cart[idx].qty = Math.max(0, Number(qty) || 0);
    if (cart[idx].qty === 0) cart.splice(idx, 1);
    writeCart(cart);
  }
}
export function clearCart() { writeCart([]); }
