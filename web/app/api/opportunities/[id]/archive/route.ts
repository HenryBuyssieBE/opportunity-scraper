import { archiveOpportunity } from "../../../../../lib/opportunities";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await archiveOpportunity(Number(id));
  return Response.json({ status: "archived" });
}
