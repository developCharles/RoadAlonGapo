import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from './Toast'
import { fetchMessages, fetchAllMessages, insertMessage, markMessagesRead, subscribeMessages } from '../lib/api'
import { BARANGAYS } from '../lib/constants'
import { cn, timeAgo } from '../lib/utils'

export default function MessagesView({ role }) {
  const { profile } = useAuth()
  const toast = useToast()
  const isEngineer = role === 'engineer'
  const [selected, setSelected] = useState(isEngineer ? null : profile?.barangay || BARANGAYS[0])
  const [messages, setMessages] = useState([])
  const [threads, setThreads] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const threadRef = useRef(null)

  useEffect(() => {
    if (!selected) return undefined
    let active = true
    const load = async () => {
      try {
        const rows = await fetchMessages(selected)
        if (!active) return
        setMessages(rows)
        await markMessagesRead(selected, role)
      } catch (e) {
        console.warn('[messages]', e)
      }
    }
    load()
    const unsub = subscribeMessages(selected, load)
    return () => {
      active = false
      unsub()
    }
  }, [selected, role])

  useEffect(() => {
    if (!isEngineer) return undefined
    let active = true
    const loadThreads = async () => {
      try {
        const rows = await fetchAllMessages()
        if (!active) return
        const map = new Map()
        rows.forEach((m) => {
          if (!map.has(m.barangay)) {
            map.set(m.barangay, { barangay: m.barangay, last: m, unread: 0 })
          }
          const t = map.get(m.barangay)
          if (m.createdAt > t.last.createdAt) t.last = m
          const readCol = role === 'engineer' ? m.readByEngineer : m.readByBarangay
          if (!readCol && m.senderRole !== role) t.unread += 1
        })
        const list = Array.from(map.values()).sort(
          (a, b) => new Date(b.last.createdAt) - new Date(a.last.createdAt)
        )
        setThreads(list)
        setSelected((prev) => prev || list[0]?.barangay || null)
      } catch (e) {
        console.warn('[threads]', e)
      }
    }
    loadThreads()
    return () => {
      active = false
    }
  }, [isEngineer, role])

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length, selected])

  const send = async () => {
    const value = text.trim()
    if (!value || !selected) return
    setSending(true)
    try {
      const readCol = role === 'engineer' ? 'readByEngineer' : 'readByBarangay'
      const otherCol = role === 'engineer' ? 'readByBarangay' : 'readByEngineer'
      await insertMessage({
        barangay: selected,
        senderId: profile.id,
        senderName: profile.name,
        senderRole: role,
        text: value,
        [readCol]: true,
        [otherCol]: false
      })
      setText('')
    } catch (e) {
      toast('Could not send message.', 'error')
    } finally {
      setSending(false)
    }
  }

  if (isEngineer && !selected) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-line bg-card px-4 py-3.5">
          <div className="text-[0.72rem] font-extrabold uppercase tracking-wide text-gray-400">Direct Channels</div>
          <div className="text-[1.1rem] font-extrabold text-ink">Barangay Offices</div>
        </div>
        <div className="flex-1 overflow-y-auto p-3.5">
          {threads.length === 0 ? (
            <p className="py-10 text-center text-[0.85rem] text-gray-400">No conversations yet.</p>
          ) : (
            threads.map((t) => (
              <div
                key={t.barangay}
                className="mb-2.5 flex cursor-pointer items-center gap-3 rounded-[14px] border-l-4 border-transparent bg-card p-3.5 shadow-card active:scale-[0.98]"
                style={{ borderLeftColor: t.unread ? '#0056b3' : 'transparent' }}
                onClick={() => setSelected(t.barangay)}
              >
                <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-[13px] bg-primary/10">
                  <i className="fas fa-building text-[1.1rem] text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[0.92rem] font-extrabold text-ink">{t.barangay}</div>
                  <div className="truncate text-[0.78rem] text-gray-400">{t.last.text}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[0.67rem] font-semibold text-gray-400">{timeAgo(t.last.createdAt)}</span>
                  {t.unread > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[0.6rem] font-extrabold text-white">
                      {t.unread}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  const partner = role === 'engineer' ? selected : 'City Engineering Office'

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-shrink-0 border-b border-line bg-card px-4 py-3.5">
        <div className="text-[0.72rem] font-extrabold uppercase tracking-wide text-gray-400">Direct Channel</div>
        <div className="text-[1.1rem] font-extrabold text-ink">{partner}</div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[0.76rem] text-muted">
          <span className="h-[7px] w-[7px] rounded-full bg-success" /> Online
        </div>
      </div>

      <div ref={threadRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center text-gray-300">
            <i className="fas fa-comments mb-3.5 block text-[2.5rem]" />
            <p className="text-[0.85rem] leading-relaxed text-gray-400">
              No messages yet. Start the conversation about road issues in {selected}.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {messages.map((m) => {
              const mine = m.senderId === profile.id
              return (
                <div key={m.id} className={cn('flex max-w-[78%] flex-col', mine ? 'self-end items-end' : 'self-start items-start')}>
                  <span className="mb-0.5 text-[0.68rem] font-extrabold uppercase tracking-wide text-gray-400">
                    {mine ? 'You' : m.senderName}
                  </span>
                  <div
                    className={cn(
                      'rounded-2xl px-3.5 py-2.5 text-[0.88rem] leading-relaxed text-ink',
                      mine ? 'rounded-br-sm bg-primary-dark text-white' : 'rounded-bl-sm bg-card shadow-card'
                    )}
                  >
                    {m.text}
                  </div>
                  <span className="mt-1 text-[0.65rem] font-semibold text-gray-400">{timeAgo(m.createdAt)}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex flex-shrink-0 items-end gap-2.5 border-t border-line bg-card p-3">
        <textarea
          className="max-h-[110px] flex-1 resize-none rounded-xl border-[1.5px] border-line bg-gray-50 px-3 py-2.5 text-[0.9rem] text-ink outline-none focus:border-primary focus:bg-white"
          placeholder="Type a message…"
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
        />
        <button
          className="flex h-[42px] w-[42px] flex-shrink-0 cursor-pointer items-center justify-center rounded-xl bg-primary-dark text-white disabled:opacity-40"
          onClick={send}
          disabled={sending || !text.trim()}
        >
          <i className="fas fa-paper-plane text-[0.95rem]" />
        </button>
      </div>
    </div>
  )
}
