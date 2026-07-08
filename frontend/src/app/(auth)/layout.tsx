export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-xl font-semibold tracking-tight">Flowdeck</div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
