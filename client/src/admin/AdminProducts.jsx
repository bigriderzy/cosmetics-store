import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = () => {
    api.getAdminProducts().then(data => { setProducts(data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleToggleStatus = async (product) => {
    const newStatus = product.status === 'active' ? 'hidden' : 'active';
    await api.updateProductStatus(product.id, newStatus);
    fetchProducts();
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`确定删除 "${product.name}" 吗？`)) return;
    await api.deleteProduct(product.id);
    fetchProducts();
  };

  if (loading) return <div className="text-center text-gray-400 py-10">加载中...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm text-gray-500">共 {products.length} 件商品</h2>
        <Link to="/admin/products/new" className="px-4 py-1.5 bg-pink-500 text-white text-sm rounded-full">
          + 新增
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center text-gray-400 py-10">暂无商品，点击上方新增</div>
      ) : (
        <div className="space-y-2">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-lg p-3 flex gap-3">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                {product.images[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">暂无</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm text-gray-800 line-clamp-1">{product.name}</h3>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0 ${
                    product.status === 'active' ? 'bg-green-100 text-green-600' :
                    product.status === 'sold_out' ? 'bg-gray-100 text-gray-500' :
                    'bg-red-50 text-red-500'
                  }`}>
                    {product.status === 'active' ? '在售' : product.status === 'sold_out' ? '售罄' : '隐藏'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-pink-600 font-bold text-sm">¥{product.price}</span>
                  <span className="text-gray-400 text-xs">库存 {product.stock}</span>
                </div>

                <div className="flex gap-2 mt-2">
                  <Link
                    to={`/admin/products/${product.id}/edit`}
                    className="text-xs px-2 py-1 text-blue-600 bg-blue-50 rounded"
                  >
                    编辑
                  </Link>
                  <button
                    onClick={() => handleToggleStatus(product)}
                    className={`text-xs px-2 py-1 rounded ${product.status === 'active' ? 'text-orange-600 bg-orange-50' : 'text-green-600 bg-green-50'}`}
                  >
                    {product.status === 'active' ? '下架' : '上架'}
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="text-xs px-2 py-1 text-red-500 bg-red-50 rounded"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
