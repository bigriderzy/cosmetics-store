import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { token } = await api.login(password);
      localStorage.setItem('admin_token', token);
      navigate('/admin');
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-bold text-center text-pink-600 mb-8">管理后台</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm">
          {error && <div className="mb-3 p-2 bg-red-50 text-red-500 text-sm rounded">{error}</div>}
          <label className="text-sm text-gray-600">管理密码</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="请输入管理密码"
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-pink-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-2.5 bg-pink-500 text-white rounded-lg font-medium active:bg-pink-600 disabled:bg-gray-300"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
}
