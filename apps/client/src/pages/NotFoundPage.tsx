import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50">
      <div className="text-center">
        <div className="text-6xl font-bold text-surface-200 mb-2">404</div>
        <p className="text-sm text-surface-500 mb-6">This page doesn't exist</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          <ArrowLeft className="w-4 h-4" /> Go Home
        </button>
      </div>
    </div>
  );
}
