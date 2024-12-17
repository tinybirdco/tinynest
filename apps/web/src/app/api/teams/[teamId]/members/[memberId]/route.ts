import { NextResponse } from "next/server";
import { updateMemberRole, removeMember } from "@/lib/teams";
import { TeamRole } from "@/types/team";

export async function PATCH(
  request: Request,
  { params }: { params: { teamId: string; memberId: string } }
) {
  try {
    const { role } = await request.json();
    
    if (!role || !["admin", "member"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    const member = await updateMemberRole(
      params.teamId,
      params.memberId,
      role as TeamRole
    );
    return NextResponse.json(member);
  } catch (error) {
    console.error("Failed to update member role:", error);
    return NextResponse.json(
      { error: "Failed to update member role" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { teamId: string; memberId: string } }
) {
  try {
    await removeMember(params.teamId, params.memberId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove member:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}
