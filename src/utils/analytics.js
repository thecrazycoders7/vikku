export const trackPageView = (path, title) => {
  if (typeof window === 'undefined') return

  if (window.gtag) {
    window.gtag('config', 'G-VFDQ5CD808', {
      page_path:     path,
      page_title:    title,
      page_location: window.location.href,
    })
  }

  if (window.clarity) {
    window.clarity('set', 'page', path)
    window.clarity('set', 'page_title', title)
  }
}

export const trackEvent = (eventName, params = {}) => {
  if (typeof window === 'undefined') return

  if (window.gtag) {
    window.gtag('event', eventName, params)
  }

  if (window.clarity) {
    window.clarity('event', eventName)
  }
}

export const trackCaseStudyView = (slug, title) => {
  trackEvent('case_study_view', {
    event_category: 'engagement',
    event_label:    title,
    case_study:     slug,
  })
}

export const trackContactSubmit = (service) => {
  trackEvent('contact_form_submit', {
    event_category: 'conversion',
    service_type:   service,
  })
}

export const trackCTAClick = (label, destination) => {
  trackEvent('cta_click', {
    event_category: 'engagement',
    event_label:    label,
    destination,
  })
}
