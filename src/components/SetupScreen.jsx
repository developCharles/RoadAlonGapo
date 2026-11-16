export default function SetupScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas p-6">
      <div className="w-full max-w-[560px] rounded-2xl bg-card p-6 shadow-card">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-xl text-primary">
            <i className="fas fa-plug-circle-exclamation" />
          </div>
          <div>
            <h1 className="text-lg font-black text-ink">Supabase not configured</h1>
            <p className="text-[0.8rem] text-muted">Add your project keys to get started.</p>
          </div>
        </div>

        <ol className="mb-4 list-decimal space-y-2 pl-5 text-[0.85rem] leading-relaxed text-ink">
          <li>
            Create a project at <span className="font-bold">supabase.com</span>.
          </li>
          <li>
            Run <code className="rounded bg-canvas px-1.5 py-0.5 text-[0.78rem]">supabase/schema.sql</code> in
            the SQL editor.
          </li>
          <li>
            Copy <code className="rounded bg-canvas px-1.5 py-0.5 text-[0.78rem]">.env.example</code> to{' '}
            <code className="rounded bg-canvas px-1.5 py-0.5 text-[0.78rem]">.env</code> and fill in your keys.
          </li>
          <li>
            Restart the dev server with <code className="rounded bg-canvas px-1.5 py-0.5 text-[0.78rem]">npm run dev</code>.
          </li>
        </ol>

        <div className="rounded-xl bg-info-bg p-3 text-[0.78rem] font-semibold text-info">
          The app runs in read-only setup mode until the environment variables are present.
        </div>
      </div>
    </div>
  )
}
