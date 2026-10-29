import { useEffect, useState } from 'react'
import { pmBoards } from '../../../lib/crmService'

// Progress and client link for the PM boards linked to these CRM projects (see pmBoards).
// A failed lookup just shows no progress; the CRM page itself keeps working.
export default function usePmBoards(projects) {
  const ids = projects.map(p => p.pm_project_id).filter(Boolean).sort().join(',')
  const [boards, setBoards] = useState({})
  useEffect(() => {
    if (!ids) { setBoards({}); return }
    pmBoards(ids.split(',')).then(setBoards).catch(() => setBoards({}))
  }, [ids])
  return boards
}
