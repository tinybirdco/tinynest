import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./db";
import type { Team, TeamMember } from "@/types/team";
import { createInvitation } from "./invitations";

export async function getUserTeams(): Promise<Team[]> {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const teams = await prisma.team.findMany({
    where: {
      OR: [
        { ownerId: userId },
        {
          members: {
            some: {
              userId,
            },
          },
        },
      ],
    },
    include: {
      members: true,
    },
  });

  return teams.map(team => ({
    ...team,
    members: team.members.map(member => ({
      ...member,
      role: member.role.toLowerCase() as TeamMember["role"],
    })),
  }));
}

export async function createTeam(name: string): Promise<Team> {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const user = await currentUser();

  const team = await prisma.team.create({
    data: {
      name,
      ownerId: userId,
      members: {
        create: {
          userId,
          role: "ADMIN",
          email: user.emailAddresses[0]?.emailAddress || "",
          name: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}`
            : user.username || "",
        },
      },
    },
    include: {
      members: true,
    },
  });

  return {
    ...team,
    members: team.members.map(member => ({
      ...member,
      role: member.role.toLowerCase() as TeamMember["role"],
    })),
  };
}

export async function getTeam(teamId: string): Promise<Team | null> {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: true,
    },
  });

  if (!team) return null;

  return {
    ...team,
    members: team.members.map(member => ({
      ...member,
      role: member.role.toLowerCase() as TeamMember["role"],
    })),
  };
}

export async function inviteToTeam(
  teamId: string, 
  email: string, 
  role: TeamMember["role"]
): Promise<void> {
  await createInvitation(teamId, email, role);
}

export async function updateMemberRole(
  teamId: string,
  memberId: string,
  newRole: TeamMember["role"]
): Promise<TeamMember> {
  const { userId } = auth();
  if (!userId) throw new Error("Not authenticated");

  // Check if user has admin rights
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: true,
    },
  });

  if (!team) throw new Error("Team not found");

  const isAdmin = team.members.some(
    m => m.userId === userId && m.role === "ADMIN"
  );
  if (!isAdmin) throw new Error("Not authorized");

  const member = team.members.find(m => m.id === memberId);
  if (!member) throw new Error("Member not found");

  // Don't allow changing the role of the team owner
  if (team.ownerId === member.userId) {
    throw new Error("Cannot change team owner's role");
  }

  const updatedMember = await prisma.teamMember.update({
    where: { id: memberId },
    data: { role: newRole.toUpperCase() as "ADMIN" | "MEMBER" },
  });

  return {
    ...updatedMember,
    role: updatedMember.role.toLowerCase() as TeamMember["role"],
  };
}

export async function removeMember(
  teamId: string,
  memberId: string
): Promise<void> {
  const { userId } = auth();
  if (!userId) throw new Error("Not authenticated");

  // Check if user has admin rights
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: true,
    },
  });

  if (!team) throw new Error("Team not found");

  const isAdmin = team.members.some(
    m => m.userId === userId && m.role === "ADMIN"
  );
  if (!isAdmin) throw new Error("Not authorized");

  const member = team.members.find(m => m.id === memberId);
  if (!member) throw new Error("Member not found");

  // Don't allow removing the team owner
  if (team.ownerId === member.userId) {
    throw new Error("Cannot remove team owner");
  }

  await prisma.teamMember.delete({
    where: { id: memberId },
  });
}
