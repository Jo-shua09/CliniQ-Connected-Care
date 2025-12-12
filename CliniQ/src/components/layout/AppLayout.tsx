import Sidebar from "./Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:pl-64">
        <div className="min-h-screen p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
