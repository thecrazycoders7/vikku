import { useState, useEffect } from 'react'
import { File, FileImage, FileText, Download, Eye, EyeOff, Loader2, Paperclip } from 'lucide-react'
import { getProjectAttachments, getAttachmentUrl, toggleAttachmentVisibility } from '../../lib/pmService'

const FILTERS = ['All', 'Images', 'Documents', 'Other']

function fileCategory(mime) {
  if (!mime) return 'Other'
  if (mime.startsWith('image/')) return 'Images'
  if (
    mime.includes('pdf') || mime.includes('word') || mime.includes('spreadsheet') ||
    mime.includes('presentation') || mime.includes('text/') || mime.includes('excel') ||
    mime.includes('powerpoint')
  ) return 'Documents'
  return 'Other'
}

function FileIcon({ mime }) {
  if (mime?.startsWith('image/')) return <FileImage size={14} className="text-blue-400 flex-shrink-0" />
  if (mime?.includes('pdf') || mime?.includes('word') || mime?.includes('text/')) return <FileText size={14} className="text-orange-400 flex-shrink-0" />
  return <File size={14} className="text-white/40 flex-shrink-0" />
}

function fmtSize(bytes) {
  if (!bytes) return ''
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${Math.round(bytes / 1024)} KB`
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function FilesPanel({ projectId, isOwner = false }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [downloading, setDownloading] = useState(null)

  useEffect(() => {
    if (!projectId) return
    setLoading(true)
    getProjectAttachments(projectId)
      .then(setFiles)
      .finally(() => setLoading(false))
  }, [projectId])

  const filtered = filter === 'All' ? files : files.filter(f => fileCategory(f.mime_type) === filter)

  const handleDownload = async (f) => {
    setDownloading(f.id)
    const url = await getAttachmentUrl(f.file_path)
    if (url) window.open(url, '_blank')
    setDownloading(null)
  }

  const handleToggleVisibility = async (f) => {
    const next = !f.visible_to_client
    setFiles(prev => prev.map(x => x.id === f.id ? { ...x, visible_to_client: next } : x))
    await toggleAttachmentVisibility(f.id, next)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={18} className="text-white/30 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter strip */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              filter === f
                ? 'bg-white text-black'
                : 'text-white/40 hover:text-white border border-white/[0.08] hover:border-white/20'
            }`}
          >
            {f}
            {f === 'All' && files.length > 0 && (
              <span className="ml-1.5 text-[10px] opacity-60">{files.length}</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
            <Paperclip size={18} className="text-white/20" />
          </div>
          <p className="text-sm text-white/30">
            {filter === 'All' ? 'No files attached to tasks yet.' : `No ${filter.toLowerCase()} found.`}
          </p>
          <p className="text-[11px] text-white/20 mt-1">Open a task and attach files from the task detail panel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {filtered.map((f) => (
            <div
              key={f.id}
              className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3 group hover:border-white/15 transition-colors"
            >
              <div className="mt-0.5">
                <FileIcon mime={f.mime_type} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80 font-medium truncate">{f.file_name}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {f.task_title && (
                    <span className="text-[10px] text-white/30 truncate max-w-[140px]">
                      {f.task_title}
                    </span>
                  )}
                  {f.file_size > 0 && (
                    <span className="text-[10px] text-white/20">{fmtSize(f.file_size)}</span>
                  )}
                  <span className="text-[10px] text-white/20">{fmtDate(f.created_at)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {isOwner && (
                  <button
                    onClick={() => handleToggleVisibility(f)}
                    title={f.visible_to_client ? 'Visible to client - click to hide' : 'Hidden from client - click to share'}
                    className={`transition-colors ${
                      f.visible_to_client
                        ? 'text-green-400 hover:text-green-300'
                        : 'text-white/20 hover:text-white/50 opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {f.visible_to_client ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                )}
                <button
                  onClick={() => handleDownload(f)}
                  disabled={downloading === f.id}
                  className="text-white/20 hover:text-white/70 transition-colors opacity-0 group-hover:opacity-100"
                >
                  {downloading === f.id
                    ? <Loader2 size={13} className="animate-spin" />
                    : <Download size={13} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
