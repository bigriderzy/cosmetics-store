import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, resolveImageUrl } from '../utils/api';
import { useCart } from '../hooks/useCart';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const { totalCount } = useCart();

  useEffect(() => {
    api.getProducts().then(data => {
      setProducts(data);
      const cats = [...new Set(data.map(p => p.category).filter(Boolean))];
      setCategories(cats);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

  if (loading) {
    return <div className="p-4 text-center text-gray-400 mt-20">加载中...</div>;
  }

  return (
    <div className="pb-16">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-pink-600">尾货化妆品甩卖</h1>
          <div className="flex items-center gap-4">
            <Link to="/orders" className="text-sm text-gray-500">我的订单</Link>
            <Link to="/cart" className="relative">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {totalCount}
              </span>
            )}
          </Link>
          </div>
        </div>

        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${!selectedCategory ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              全部
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${selectedCategory === cat ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Product Grid */}
      <div className="p-3 grid grid-cols-2 gap-3">
        {filteredProducts.length === 0 ? (
          <div className="col-span-2 text-center text-gray-400 py-20">暂无商品</div>
        ) : (
          filteredProducts.map(product => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="bg-white rounded-lg overflow-hidden shadow-sm active:shadow-none transition-shadow"
            >
              <div className="aspect-square bg-gray-100">
                {product.images[0] ? (
                  <img src={resolveImageUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">暂无图片</div>
                )}
              </div>
              <div className="p-2">
                <h3 className="text-sm line-clamp-2 text-gray-800">{product.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-pink-600 font-bold text-base">¥{product.price}</span>
                  {product.original_price && (
                    <span className="text-gray-400 line-through text-xs">¥{product.original_price}</span>
                  )}
                </div>
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="text-orange-500 text-xs">仅剩 {product.stock} 件</span>
                )}
                {product.stock === 0 && (
                  <span className="text-gray-400 text-xs">已售罄</span>
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Bottom cart bar */}
      {totalCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3">
          <Link
            to="/cart"
            className="flex items-center justify-center gap-2 bg-pink-500 text-white py-2.5 rounded-full font-medium"
          >
            购物车 ({totalCount}) — 去结算
          </Link>
        </div>
      )}
    </div>
  );
}
