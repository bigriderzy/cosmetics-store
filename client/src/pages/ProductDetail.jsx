import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useCart } from '../hooks/useCart';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    api.getProduct(id)
      .then(data => { setProduct(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [id]);

  if (loading) return <div className="p-4 text-center text-gray-400 mt-20">加载中...</div>;
  if (!product) return <div className="p-4 text-center text-gray-400 mt-20">商品不存在</div>;

  const images = Array.isArray(product.images) ? product.images : [];
  const soldOut = product.stock <= 0 || product.status !== 'active';

  const handleAddToCart = () => {
    addItem(product, qty);
  };

  const handleBuyNow = () => {
    // 先同步写入 localStorage，确保 Checkout 页面能读到
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const idx = cart.findIndex(item => item.product_id === product.id);
    if (idx >= 0) {
      cart[idx].qty = Math.min(cart[idx].qty + qty, product.stock);
    } else {
      cart.push({
        product_id: product.id, name: product.name, price: product.price,
        image: Array.isArray(product.images) ? product.images[0] : '',
        qty, stock: product.stock,
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    addItem(product, qty);
    navigate('/checkout');
  };

  return (
    <div className="pb-6">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="fixed top-3 left-3 z-10 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Image carousel */}
      <div className="aspect-square bg-gray-100 relative">
        {images.length > 0 ? (
          <>
            <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            {images.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-2 h-2 rounded-full ${i === selectedImage ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">暂无图片</div>
        )}
      </div>

      {/* Product info */}
      <div className="p-4">
        <h1 className="text-lg font-bold text-gray-900">{product.name}</h1>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-2xl font-bold text-pink-600">¥{product.price}</span>
          {product.original_price && (
            <span className="text-gray-400 line-through">¥{product.original_price}</span>
          )}
        </div>

        <div className="mt-3 text-sm text-gray-500">
          库存：{soldOut ? <span className="text-red-500">已售罄</span> : `${product.stock} 件`}
        </div>

        {product.description && (
          <div className="mt-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {product.description}
          </div>
        )}
      </div>

      {/* Quantity selector + Buy actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex items-center gap-3">
        {!soldOut && (
          <div className="flex items-center border rounded-lg">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="px-3 py-2 text-gray-500 active:bg-gray-100"
            >
              −
            </button>
            <span className="px-3 py-2 text-sm font-medium min-w-[2rem] text-center">{qty}</span>
            <button
              onClick={() => setQty(Math.min(product.stock, qty + 1))}
              className="px-3 py-2 text-gray-500 active:bg-gray-100"
            >
              +
            </button>
          </div>
        )}

        <button
          onClick={handleAddToCart}
          disabled={soldOut}
          className="flex-1 py-2.5 rounded-full font-medium border border-pink-500 text-pink-600 active:bg-pink-50 disabled:border-gray-200 disabled:text-gray-300"
        >
          加入购物车
        </button>

        <button
          onClick={handleBuyNow}
          disabled={soldOut}
          className="flex-1 py-2.5 rounded-full font-medium bg-pink-500 text-white active:bg-pink-600 disabled:bg-gray-200 disabled:text-gray-400"
        >
          {soldOut ? '已售罄' : '立即购买'}
        </button>
      </div>
    </div>
  );
}
