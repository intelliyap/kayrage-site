import { techniqueMap } from "@/lib/techniques/library";
import { TechniqueDetail } from "@/components/browse/TechniqueDetail";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function TechniquePage({ params }: Props) {
  const { code } = await params;
  const technique = techniqueMap[code.toUpperCase()];

  if (!technique) {
    notFound();
  }

  return <TechniqueDetail technique={technique} />;
}

export function generateStaticParams() {
  return Object.keys(techniqueMap).map((code) => ({ code }));
}
