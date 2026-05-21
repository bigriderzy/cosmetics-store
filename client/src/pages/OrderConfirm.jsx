import { useParams, useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function OrderConfirm() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [qrcode, setQrcode] = useState('');

  useEffect(() => {
    api.getPublicSettings().then(s => {
      if (s.payment_qrcode) setQrcode(s.payment_qrcode);
    }).catch(() => {});
  }, [id]);

  if (!order) {
    return <div className="p-4 text-center text-gray-400 mt-20">订单加载中...</div>;
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      {/* Success header */}
      <div className="text-center mt-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-lg font-bold mt-3">下单成功！</h1>
        <p className="text-sm text-gray-500 mt-1">订单编号：{order.id}</p>
      </div>

      {/* Order details */}
      <div className="bg-white rounded-lg p-4 mt-6">
        <h2 className="text-sm font-medium text-gray-600 mb-2">订单详情</h2>
        <div className="text-sm space-y-2">
          <div className="flex justify-between"><span className="text-gray-500">客户</span><span>{order.customer_name}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">手机</span><span>{order.customer_phone}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">金额</span><span className="text-pink-600 font-bold">¥{order.total_amount.toFixed(2)}</span></div>
          <div className="border-t pt-2 mt-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between py-1">
                <span>{item.name} × {item.qty}</span>
                <span>¥{(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment info */}
      <div className="bg-white rounded-lg p-4 mt-4 text-center">
        <h2 className="text-sm font-medium text-gray-600 mb-3">请扫码付款</h2>
        {qrcode ? (
          <img src={qrcode} alt="收款码" className="w-48 h-48 mx-auto" />
        ) : (
          <div className="w-48 h-48 mx-auto bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm">
            收款码待设置
          </div>
        )}
        <p className="text-pink-600 font-bold text-lg mt-3">¥{order.total_amount.toFixed(2)}</p>
        <p className="text-gray-500 text-xs mt-2">付款后请联系卖家确认</p>
      </div>

      <Link
        to="/"
        className="block text-center mt-4 py-2.5 bg-pink-500 text-white rounded-full font-medium active:bg-pink-600"
      >
        继续逛逛
      </Link>
    </div>
  );
}
