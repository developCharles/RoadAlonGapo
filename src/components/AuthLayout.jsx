export default function AuthLayout({ children, subtitle = 'Civic Infrastructure & Mobility' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#c7d9ee] via-[#e8eef6] to-[#d0dcee] p-5">
      <div className="mb-3 w-full max-w-[380px] text-center">
        <div className="mx-auto mb-2 flex h-[92px] w-[92px] items-center justify-center rounded-[24px] bg-primary-dark text-[2.6rem] text-white shadow-[0_6px_16px_rgba(0,61,128,0.28)]">
          <i className="fas fa-map-marked-alt" />
        </div>
        <h1 className="text-[1.1rem] font-black uppercase tracking-[2px] text-primary-dark">
          RoadAlongapo
        </h1>
        <p className="mt-0.5 text-[0.65rem] font-bold uppercase tracking-[2px] text-gray-400">
          {subtitle}
        </p>
      </div>
      {children}
    </div>
  )
}
