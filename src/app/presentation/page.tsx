import { PresentationDashboard } from "@/components/presentation/dashboard/PresentationDashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function page() {
  return <PresentationDashboard />;
}
