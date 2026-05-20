import { useState, useEffect, useCallback } from 'react';

function loadCart() {
  try {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function useCart() {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product_id === product.id
            ? { ...item, qty: Math.min(item.qty + qty, product.stock) }
            : item
        );
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        price: product.price,
        image: Array.isArray(product.images) ? product.images[0] : '',
        qty,
        stock: product.stock,
      }];
    });
  }, []);

  const updateQty = useCallback((productId, qty) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(item => item.product_id !== productId));
    } else {
      setItems(prev => prev.map(item =>
        item.product_id === productId ? { ...item, qty } : item
      ));
    }
  }, []);

  const removeItem = useCallback((productId) => {
    setItems(prev => prev.filter(item => item.product_id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalCount = items.reduce((sum, item) => sum + item.qty, 0);

  return { items, addItem, updateQty, removeItem, clearCart, totalAmount, totalCount };
}
