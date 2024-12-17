import { NextResponse } from "next/server";
import { inviteToTeam } from "@/lib/teams";
import { TeamRole } from "@/types/team";

export async function POST(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const { email, role } = await request.json();
    
    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    if (!["admin", "member"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    const member = await inviteToTeam(params.teamId, email, role as TeamRole);
    return NextResponse.json(member);
  } catch (error) {
    console.error("Failed to invite member:", error);
    return NextResponse.json(
      { error: "Failed to invite member" },
      { status: 500 }
    );
  }
}
