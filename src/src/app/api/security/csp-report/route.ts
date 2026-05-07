import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const report = await req.json();
    // Log the CSP violation report
    console.warn("CSP Violation:", report);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
