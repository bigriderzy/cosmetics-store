import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';

export default function Cart() {
  const { items, updateQty, removeItem, totalAmount } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="p-4">
        <h1 className="text-lg font-bold text-center mb-2">购物车</h1>
        <div className="text-center text-gray-400 mt-20">
          <p className="text-4xl mb-3">🛒</p>
          <p>购物车是空的</p>
          <Link to="/" className="inline-block mt-4 px-6 py-2 bg-pink-500 text-white rounded-full text-sm">
            去逛逛
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <h1 className="text-lg font-bold text-center py-3 border-b bg-white">购物车 ({items.length})</h1>

      <div className="m-3 space-y-3">
        {items.map(item => (
          <div key={item.product_id} className="bg-white rounded-lg p-3 flex gap-3">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">暂无</div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm text-gray-800 line-clamp-2">{item.name}</h3>
              <p className="text-pink-600 font-bold mt-1">¥{item.price}</p>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center border rounded">
                  <button onClick={() => updateQty(item.product_id, item.qty - 1)} className="px-2 py-1 text-gray-500 active:bg-gray-100">−</button>
                  <span className="px-2 py-1 text-sm min-w-[1.5rem] text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item.product_id, item.qty + 1)} className="px-2 py-1 text-gray-500 active:bg-gray-100">+</button>
                </div>
                <button onClick={() => removeItem(item.product_id)} className="text-gray-400 text-sm active:text-red-500">删除</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-600">合计</span>
          <span className="text-xl font-bold text-pink-600">¥{totalAmount.toFixed(2)}</span>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          className="w-full py-2.5 bg-pink-500 text-white rounded-full font-medium active:bg-pink-600"
        >
          去结算
        </button>
      </div>
    </div>
  );
}
