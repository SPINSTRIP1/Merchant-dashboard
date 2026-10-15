import Providers from "../(dashboard)/providers";

// Signed-in only (same auth + React Query providers as the dashboard), but without the sidebar.
export default function WaiterLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
