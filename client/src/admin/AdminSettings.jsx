import { useState, useEffect } from 'react';
import { api, resolveImageUrl } from '../utils/api';

export default function AdminSettings() {
  const [paymentQrcode, setPaymentQrcode] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getSettings().then(s => {
      if (s.payment_qrcode) setPaymentQrcode(s.payment_qrcode);
    }).catch(() => {});
  }, []);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const url = await api.uploadImage(file);
      setPaymentQrcode(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSaved(false);

    const data = { payment_qrcode: paymentQrcode };
    if (adminPassword.trim()) {
      data.admin_password = adminPassword.trim();
    }

    try {
      await api.updateSettings(data);
      setSaved(true);
      setAdminPassword('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-sm text-gray-500 mb-3">店铺设置</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 space-y-4">
        {error && <div className="p-2 bg-red-50 text-red-500 text-sm rounded">{error}</div>}
        {saved && <div className="p-2 bg-green-50 text-green-600 text-sm rounded">设置已保存</div>}

        <div>
          <label className="text-xs text-gray-500">收款二维码</label>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={paymentQrcode}
              onChange={e => setPaymentQrcode(e.target.value)}
              placeholder="粘贴收款码图片 URL 或点击右侧按钮上传"
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-pink-500"
            />
            <label className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer active:opacity-80 ${uploading ? 'bg-gray-300 text-white' : 'bg-pink-50 text-pink-600'}`}>
              {uploading ? '上传中' : '选择图片'}
              <input type="file" accept="image/*" onChange={handleFileSelect} disabled={uploading} className="hidden" />
            </label>
          </div>
          {paymentQrcode && (
            <div className="mt-2 p-2 border rounded-lg inline-block">
              <img src={resolveImageUrl(paymentQrcode)} alt="收款码预览" className="w-32 h-32 object-contain" />
            </div>
          )}
        </div>

        <div>
          <label className="text-xs text-gray-500">修改管理密码（留空不修改）</label>
          <input
            type="password"
            value={adminPassword}
            onChange={e => setAdminPassword(e.target.value)}
            placeholder="留空则不修改密码"
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-pink-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-pink-500 text-white rounded-full font-medium active:bg-pink-600 disabled:bg-gray-300"
        >
          {loading ? '保存中...' : '保存设置'}
        </button>
      </form>
    </div>
  );
}
