// Website sign-ups go through the bot-checked server function (api/send-tool-result.js); the browser can't
// write to `subscribers` directly. `startedAt` is when the form appeared (bots submit instantly),
// `website` is the hidden trap field (people never see it, bots fill it in).
export async function subscribe({ email, source, website, startedAt }) {
  const res = await fetch('/api/send-tool-result', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, source, website, elapsedMs: Date.now() - startedAt }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error || 'Something went wrong. Try again.'), { status: res.status })
}

// Props for the hidden trap input: off-screen, skipped by keyboard, screen readers and autofill.
export const trapProps = {
  type: 'text', name: 'website', tabIndex: -1, autoComplete: 'off', 'aria-hidden': true,
  style: { position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 },
}
