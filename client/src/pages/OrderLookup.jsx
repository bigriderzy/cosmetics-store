import { useState } from 'react';
import { api } from '../utils/api';

const STATUS_MAP = {
  pending:   { label: '待确认', color: 'bg-yellow-100 text-yellow-700' },
  paid:      { label: '已付款', color: 'bg-blue-100 text-blue-700' },
  shipped:   { label: '已发货', color: 'bg-purple-100 text-purple-700' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-500' },
};

export default function OrderLookup() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('请输入手机号');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.getOrdersByPhone(phone.trim());
      setOrders(data);
      setSearched(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-6">
      <h1 className="text-lg font-bold text-center py-3 border-b bg-white">我的订单</h1>

      <form onSubmit={handleSearch} className="m-3 bg-white rounded-lg p-3">
        <label className="text-xs text-gray-500">输入下单手机号查询订单</label>
        <div className="flex gap-2 mt-1">
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="请输入手机号"
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-pink-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg text-sm font-medium active:bg-pink-600 disabled:bg-gray-300"
          >
            {loading ? '查询中...' : '查询'}
          </button>
        </div>
        {error && <div className="mt-2 p-2 bg-red-50 text-red-500 text-sm rounded">{error}</div>}
      </form>

      <div className="mx-3 space-y-3">
        {!searched ? (
          <div className="text-center text-gray-400 py-10">输入手机号查询您的订单</div>
        ) : orders && orders.length === 0 ? (
          <div className="text-center text-gray-400 py-10">暂无订单</div>
        ) : orders && (
          orders.map(order => (
            <div key={order.id} className="bg-white rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">#{order.id}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_MAP[order.status]?.color}`}>
                  {STATUS_MAP[order.status]?.label}
                </span>
              </div>
              {order.items.map((item, i) => (
                <div key={i} className="text-sm flex justify-between py-1">
                  <span>{item.name} × {item.qty}</span>
                  <span>¥{(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between mt-2 pt-2 border-t text-sm">
                <span className="text-gray-400">{order.created_at}</span>
                <span className="font-bold text-pink-600">¥{order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
