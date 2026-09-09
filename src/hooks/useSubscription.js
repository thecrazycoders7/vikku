import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getSubscription } from '../lib/razorpayService'

export default function useSubscription() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState({ plan: 'free' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setSubscription({ plan: 'free' }); setLoading(false); return }
    getSubscription(user.id).then((sub) => {
      setSubscription(sub)
      setLoading(false)
    })
  }, [user])

  const isPro = subscription.plan === 'pro' || subscription.plan === 'team'
  const isTeam = subscription.plan === 'team'
  const plan = subscription.plan || 'free'

  return { subscription, setSubscription, loading, isPro, isTeam, plan }
}
