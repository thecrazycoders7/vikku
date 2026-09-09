import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '../utils/analytics'

const pageTitles = {
  '/':                       'Vikku - Software & Tech Agency',
  '/work/staffing-platform': 'Staffing & HR Platform - Vikku Case Study',
  '/work/hso-cctv':          'HSO CCTV - Vikku Case Study',
  '/work/rolex-ads':         'Rolex Ads - Vikku Case Study',
  '/work/media-manager':     'Media Manager 4U - Vikku Case Study',
}

export default function RouteTracker() {
  const location = useLocation()

  useEffect(() => {
    const title = pageTitles[location.pathname] || document.title
    trackPageView(location.pathname, title)
  }, [location.pathname])

  return null
}
