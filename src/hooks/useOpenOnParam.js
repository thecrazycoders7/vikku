import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

// Lets a link open a page's own form or record, e.g. the admin "Create new" menu links to
// /admin/crm/leads?new=1. Calls open(value) once `ready` is true, then drops the param
// so a refresh or Back doesn't reopen it.
export default function useOpenOnParam(name, open, ready = true) {
  const [params, setParams] = useSearchParams()
  const value = params.get(name)
  useEffect(() => {
    if (!value || !ready) return
    open(value)
    const next = new URLSearchParams(params)
    next.delete(name)
    setParams(next, { replace: true })
  }, [value, ready])
}
