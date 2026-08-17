export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-0 flex-1 flex-col animate-page-enter">{children}</div>;
}
