import { NextResponse } from "next/server";
import { acceptInvitation } from "@/lib/invitations";
import * as React from 'react'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    console.log("------ LOOK AT ME IM MR ACCEPTED -------");
    const { token } = await params;
    const member = await acceptInvitation(token);
    console.log(member);
    return NextResponse.json(member);
  } catch (error) {
    console.error("Failed to accept invitation:", error.stack);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to accept invitation" },
      { status: 500 }
    );
  }
}
