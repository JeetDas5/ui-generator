import { NextRequest, NextResponse } from "next/server";
import { getVersion } from "@/lib/version-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idString } = await params;
  const id = Number(idString);
  if (!Number.isFinite(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid version id." },
      { status: 400 }
    );
  }

  try {
    const record = await getVersion(id);
    if (!record) {
      return NextResponse.json(
        { success: false, message: "Version not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error("Version fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load version." },
      { status: 500 }
    );
  }
}
