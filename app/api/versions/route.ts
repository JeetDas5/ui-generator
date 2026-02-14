import { NextResponse } from "next/server";
import {
  createVersion,
  getLatestVersion,
  listVersions,
} from "@/lib/version-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const versions = await listVersions(60);
    return NextResponse.json({ success: true, data: versions });
  } catch (error) {
    console.error("Version list error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load versions." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { success: false, message: "Invalid code payload." },
        { status: 400 }
      );
    }

    const latest = await getLatestVersion();
    if (latest && latest.code === code) {
      return NextResponse.json({ success: true, data: latest });
    }

    const created = await createVersion(code);
    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    console.error("Version create error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to store version." },
      { status: 500 }
    );
  }
}
