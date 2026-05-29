import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "not_found", error_description: "No OAuth authorization server configured." },
    { status: 404 }
  );
}
