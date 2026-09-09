import { useNavigate } from 'react-router-dom'
import { Home } from 'lucide-react'
import usePageMeta from '../hooks/usePageMeta'

export default function NotFound() {
  const navigate = useNavigate()

  usePageMeta({
    title:       'Page Not Found - Vikku',
    description: 'The page you are looking for does not exist.',
    url:         'https://vikku.in/',
  })

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-xs text-white/40 tracking-widest mb-3">404</p>
      <h1 className="font-display font-extrabold text-3xl mb-2">Page Not Found</h1>
      <p className="text-white/60 text-sm max-w-md mb-6">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <button
        onClick={() => navigate('/')}
        className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs rounded-lg"
      >
        <Home size={14} /> Back to Home
      </button>
    </div>
  )
}
