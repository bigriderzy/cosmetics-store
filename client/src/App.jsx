import { Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<div className="p-4 text-center text-gray-500 mt-20">商城加载中...</div>} />
      </Routes>
    </div>
  );
}
