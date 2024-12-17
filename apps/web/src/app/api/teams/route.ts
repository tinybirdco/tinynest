import { NextResponse } from "next/server";
import { getUserTeams, createTeam } from "@/lib/teams";

export async function GET() {
  try {
    const teams = await getUserTeams();
    return NextResponse.json(teams);
  } catch (error) {
    console.error("Failed to get teams:", error);
    return NextResponse.json(
      { error: "Failed to get teams" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json(
        { error: "Team name is required" },
        { status: 400 }
      );
    }

    const team = await createTeam(name);
    return NextResponse.json(team);
  } catch (error) {
    console.error("Failed to create team:", error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
}
