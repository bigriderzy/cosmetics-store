import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getDashboard().then(setStats).catch(() => {});
  }, []);

  if (!stats) return <div className="text-center text-gray-400 py-10">加载中...</div>;

  const cards = [
    { label: '今日订单', value: stats.todayOrders, color: 'bg-blue-50 text-blue-600' },
    { label: '待处理', value: stats.pendingOrders, color: 'bg-orange-50 text-orange-600' },
    { label: '今日收入', value: `¥${stats.todayRevenue.toFixed(2)}`, color: 'bg-green-50 text-green-600' },
    { label: '在售商品', value: stats.totalProducts, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div>
      <h2 className="text-sm text-gray-500 mb-3">今日概览</h2>
      <div className="grid grid-cols-2 gap-3">
        {cards.map(card => (
          <div key={card.label} className={`rounded-lg p-4 ${card.color}`}>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-sm mt-1 opacity-75">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
