export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#f0f7f4] flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="w-16 h-16 rounded-[20px] bg-[#e4f2ec] border border-[#c8dfd5] flex items-center justify-center">
        <span className="text-2xl">🏦</span>
      </div>
      <h1 className="text-[20px] font-semibold text-[#0f2419]"
          style={{ fontFamily: "'Playfair Display', serif" }}>
        You're offline
      </h1>
      <p className="text-[13px] text-[#6a8c7a] max-w-[260px] leading-relaxed">
        Please check your connection. NexaBank requires internet access to process transactions.
      </p>
    </div>
  );
}
