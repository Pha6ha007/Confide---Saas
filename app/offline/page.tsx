export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
      <div className="text-center px-6">
        {/* Logo */}
        <div className="w-16 h-16 bg-gradient-to-br from-[#6366F1] to-[#EC4899] rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
          C
        </div>

        {/* Message */}
        <h1 className="font-serif text-2xl text-[#1F2937] mb-2">
          You&apos;re offline
        </h1>
        <p className="text-[#6B7280] mb-6 max-w-md">
          Confide needs an internet connection to talk with Alex.
          Check your connection and try again.
        </p>

        {/* Retry Button */}
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-[#6366F1] text-white rounded-xl hover:bg-[#5558E3] transition-all duration-200 font-medium"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
