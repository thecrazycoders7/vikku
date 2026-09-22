import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '../utils/analytics'

const pageTitles = {
  '/': 'Vikku - Software & Tech Agency',
}

export default function RouteTracker() {
  const location = useLocation()

  useEffect(() => {
    const title = pageTitles[location.pathname] || document.title
    trackPageView(location.pathname, title)
  }, [location.pathname])

  return null
}
