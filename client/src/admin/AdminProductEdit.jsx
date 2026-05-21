import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export default function AdminProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [form, setForm] = useState({
    name: '', description: '', price: '', original_price: '',
    images: '', stock: '0', category: '', status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState([]);

  useEffect(() => {
    if (!isNew) {
      api.getProduct(id).then(product => {
        const uploaded = Array.isArray(product.images) ? product.images.filter(u => u.startsWith('/uploads/')) : [];
        const external = Array.isArray(product.images) ? product.images.filter(u => !u.startsWith('/uploads/')) : [];
        setUploadedUrls(uploaded);
        setForm({
          name: product.name,
          description: product.description || '',
          price: String(product.price),
          original_price: product.original_price ? String(product.original_price) : '',
          images: external.join('\n'),
          stock: String(product.stock),
          category: product.category || '',
          status: product.status,
        });
      });
    }
  }, [id]);

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    setError('');
    try {
      const urls = await Promise.all(files.map(f => api.uploadImage(f)));
      setUploadedUrls(prev => [...prev, ...urls]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeUploadedUrl = (index) => {
    setUploadedUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      setError('商品名称和价格不能为空');
      return;
    }

    setLoading(true);
    setError('');

    const data = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      images: [
        ...uploadedUrls,
        ...(form.images ? form.images.split('\n').map(s => s.trim()).filter(Boolean) : []),
      ],
      stock: parseInt(form.stock) || 0,
      category: form.category,
      status: form.status,
    };

    try {
      if (isNew) {
        await api.createProduct(data);
      } else {
        await api.updateProduct(id, data);
      }
      navigate('/admin/products');
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">{isNew ? '新增商品' : '编辑商品'}</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 space-y-4">
        {error && <div className="p-2 bg-red-50 text-red-500 text-sm rounded">{error}</div>}

        <div>
          <label className="text-xs text-gray-500">商品名称 *</label>
          <input type="text" value={form.name} onChange={handleChange('name')} placeholder="商品名称"
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-pink-500" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500">售价 *</label>
            <input type="number" step="0.01" value={form.price} onChange={handleChange('price')} placeholder="29.9"
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-pink-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500">原价</label>
            <input type="number" step="0.01" value={form.original_price} onChange={handleChange('original_price')} placeholder="99.0"
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-pink-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500">库存数量</label>
            <input type="number" value={form.stock} onChange={handleChange('stock')}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-pink-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500">分类</label>
            <select value={form.category} onChange={handleChange('category')}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-pink-500">
              <option value="">选择分类</option>
              <option value="口红">口红</option>
              <option value="唇釉">唇釉</option>
              <option value="面膜">面膜</option>
              <option value="眼影">眼影</option>
              <option value="粉底">粉底</option>
              <option value="腮红">腮红</option>
              <option value="眉笔/眉粉">眉笔/眉粉</option>
              <option value="眼线">眼线</option>
              <option value="睫毛膏">睫毛膏</option>
              <option value="卸妆">卸妆</option>
              <option value="精华">精华</option>
              <option value="面霜/乳液">面霜/乳液</option>
              <option value="防晒">防晒</option>
              <option value="BB霜/CC霜">BB霜/CC霜</option>
              <option value="散粉/蜜粉">散粉/蜜粉</option>
              <option value="遮瑕">遮瑕</option>
              <option value="妆前乳">妆前乳</option>
              <option value="化妆工具">化妆工具</option>
              <option value="套装">套装</option>
              <option value="其他">其他</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500">上传图片</label>
          {/* Uploaded images preview */}
          {uploadedUrls.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-1 mb-2">
              {uploadedUrls.map((url, i) => (
                <div key={i} className="relative w-20 h-20">
                  <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                  <button type="button" onClick={() => removeUploadedUrl(i)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center leading-none">×</button>
                </div>
              ))}
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={uploading}
            className="w-full mt-1 text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-sm file:bg-pink-50 file:text-pink-600"
          />
          {uploading && <span className="text-xs text-gray-400 mt-1 inline-block">上传中...</span>}
        </div>

        <div>
          <label className="text-xs text-gray-500">或粘贴图片 URL（每行一个）</label>
          <textarea value={form.images} onChange={handleChange('images')} placeholder={"https://example.com/img1.jpg\nhttps://example.com/img2.jpg"}
            rows={3} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-pink-500 resize-none" />
        </div>

        <div>
          <label className="text-xs text-gray-500">描述</label>
          <textarea value={form.description} onChange={handleChange('description')} placeholder="商品详情描述"
            rows={4} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-pink-500 resize-none" />
        </div>

        {!isNew && (
          <div>
            <label className="text-xs text-gray-500">状态</label>
            <select value={form.status} onChange={handleChange('status')}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-pink-500">
              <option value="active">在售</option>
              <option value="sold_out">售罄</option>
              <option value="hidden">隐藏</option>
            </select>
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-2.5 bg-pink-500 text-white rounded-full font-medium active:bg-pink-600 disabled:bg-gray-300">
          {loading ? '保存中...' : '保存'}
        </button>
      </form>
    </div>
  );
}
