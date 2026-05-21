import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const STATUS_MAP = {
  pending:   { label: '待确认', color: 'bg-yellow-100 text-yellow-700' },
  paid:      { label: '已付款', color: 'bg-blue-100 text-blue-700' },
  shipped:   { label: '已发货', color: 'bg-purple-100 text-purple-700' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-500' },
};

const STATUS_FLOW = {
  pending: ['paid', 'cancelled'],
  paid: ['shipped', 'cancelled'],
  shipped: ['completed'],
  completed: [],
  cancelled: [],
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    const params = filter ? { status: filter } : {};
    api.getAdminOrders(params).then(data => { setOrders(data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <div className="text-center text-gray-400 py-10">加载中...</div>;

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-3 overflow-x-auto">
        {[
          { value: '', label: '全部' },
          { value: 'pending', label: '待确认' },
          { value: 'paid', label: '已付款' },
          { value: 'shipped', label: '已发货' },
          { value: 'completed', label: '已完成' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${filter === f.value ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Order list */}
      {orders.length === 0 ? (
        <div className="text-center text-gray-400 py-10">暂无订单</div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
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
                <span>{order.customer_name} {order.customer_phone}</span>
                <span className="font-bold text-pink-600">¥{order.total_amount.toFixed(2)}</span>
              </div>

              {order.note && (
                <div className="mt-1 text-xs text-gray-400">备注：{order.note}</div>
              )}

              <div className="text-xs text-gray-400 mt-1">{order.created_at}</div>

              {/* Action buttons */}
              {STATUS_FLOW[order.status]?.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {STATUS_FLOW[order.status].map(nextStatus => (
                    <button
                      key={nextStatus}
                      onClick={() => handleStatusChange(order.id, nextStatus)}
                      className={`text-xs px-3 py-1 rounded-full ${
                        nextStatus === 'cancelled'
                          ? 'border border-gray-300 text-gray-500'
                          : 'bg-pink-500 text-white'
                      }`}
                    >
                      {nextStatus === 'paid' ? '确认收款' :
                       nextStatus === 'shipped' ? '标记发货' :
                       nextStatus === 'completed' ? '完成' :
                       nextStatus === 'cancelled' ? '取消' : nextStatus}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
