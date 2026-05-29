export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0F1F] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[rgba(43,91,255,0.08)] blur-[120px] pointer-events-none" />
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}
