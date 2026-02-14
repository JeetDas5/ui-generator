import { getComponentSource } from "@/lib/component-source";
import MainLayout from "@/components/layout/MainLayout";

export default async function Page() {
  const componentFiles = await getComponentSource();

  return <MainLayout componentFiles={componentFiles} />;
}
