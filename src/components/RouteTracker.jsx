import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '../utils/analytics'

const pageTitles = {
  '/':                        'Vikku - Software & Tech Agency',
  '/work/tapbywisein':        'TapByWisein - Vikku Case Study',
  '/work/unisys-infotech':    'Unisys Infotech - Vikku Case Study',
  '/work/jobly-solutions':    'Jobly Solutions - Vikku Case Study',
  '/work/media-manager':      'Media Manager 4U - Vikku Case Study',
  '/work/rolex-ads':          'Rolex Ads - Vikku Case Study',
  '/work/nivi-collections':   'Nivi Collections - Vikku Case Study',
}

export default function RouteTracker() {
  const location = useLocation()

  useEffect(() => {
    const title = pageTitles[location.pathname] || document.title
    trackPageView(location.pathname, title)
  }, [location.pathname])

  return null
}
