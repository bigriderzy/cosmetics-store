import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { api } from '../utils/api';

export default function Checkout() {
  const { items, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('请填写姓名和手机号');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const order = await api.createOrder({
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        items: items.map(({ product_id, name, price, qty }) => ({ product_id, name, price, qty })),
        note: note.trim(),
      });
      clearCart();
      navigate(`/order/${order.id}`, { state: { order } });
    } catch (e) {
      setError(e.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-6">
      <h1 className="text-lg font-bold text-center py-3 border-b bg-white">确认订单</h1>

      {/* Order summary */}
      <div className="m-3 bg-white rounded-lg p-3">
        <h2 className="text-sm font-medium text-gray-600 mb-2">商品明细</h2>
        {items.map(item => (
          <div key={item.product_id} className="flex justify-between py-2 text-sm">
            <span className="text-gray-800">{item.name} × {item.qty}</span>
            <span className="text-gray-600">¥{(item.price * item.qty).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-2 mt-2 border-t font-bold">
          <span>合计</span>
          <span className="text-pink-600">¥{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Customer info form */}
      <form onSubmit={handleSubmit} className="m-3 bg-white rounded-lg p-3">
        <h2 className="text-sm font-medium text-gray-600 mb-3">收货信息</h2>

        {error && (
          <div className="mb-3 p-2 bg-red-50 text-red-500 text-sm rounded">{error}</div>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500">姓名 *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="请输入姓名"
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-pink-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">手机号 *</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="请输入手机号"
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-pink-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">备注</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="选填：给卖家的留言"
              rows={2}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-pink-500 resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-4 py-2.5 bg-pink-500 text-white rounded-full font-medium active:bg-pink-600 disabled:bg-gray-300"
        >
          {submitting ? '提交中...' : `提交订单 ¥${totalAmount.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
}
