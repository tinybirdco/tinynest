'use server';

import { currentUser } from "@clerk/nextjs/server";
import { getUserTeams, createTeam, inviteToTeam as inviteToTeamApi, updateMemberRole as updateMemberRoleApi, removeMember as removeMemberApi } from "@/lib/teams";
import type { TeamMember } from "@/types/team";

export async function getTeams() {
  const user = await currentUser();
  if (!user) throw new Error("Not authenticated");
  return getUserTeams();
}

export async function createNewTeam(name: string) {
  const user = await currentUser();
  if (!user) throw new Error("Not authenticated");
  return createTeam(name);
}

export async function inviteTeamMember(teamId: string, email: string, role: TeamMember["role"]) {
  const user = await currentUser();
  if (!user) throw new Error("Not authenticated");
  return inviteToTeamApi(teamId, email, role);
}

export async function updateTeamMemberRole(teamId: string, memberId: string, role: TeamMember["role"]) {
  const user = await currentUser();
  if (!user) throw new Error("Not authenticated");
  return updateMemberRoleApi(teamId, memberId, role);
}

export async function removeTeamMember(teamId: string, memberId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Not authenticated");
  return removeMemberApi(teamId, memberId);
}
