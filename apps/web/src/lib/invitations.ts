import { auth, currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "./db";
import { sendTeamInvitation } from "./email";
import crypto from "crypto";
import { TeamMember } from "@/types/team";

// 7 days in milliseconds
const INVITATION_EXPIRY = 7 * 24 * 60 * 60 * 1000;

export async function createInvitation(
  teamId: string,
  email: string,
  role: TeamMember["role"]
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  // Check if user has admin rights
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        where: {
          userId,
          role: "ADMIN",
        },
      },
    },
  });

  if (!team || team.members.length === 0) {
    throw new Error("Not authorized");
  }

  // Generate a secure random token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + INVITATION_EXPIRY);

  try {
    console.log("before prisma invite create");
    const invitation = await prisma.invitation.create({
      data: {
        teamId,
        email,
        role: role.toUpperCase() as "ADMIN" | "MEMBER",
        token,
        expiresAt,
      },
      include: {
        team: true,
      },
    });
    console.log("after prisma invite create");

    // Get inviter's name
    const inviter = await currentUser();
    const inviterName = inviter!.firstName && inviter!.lastName
      ? `${inviter!.firstName} ${inviter!.lastName}`
      : inviter!.username || "A team member";

    console.log("after get inviter name");

    // Send invitation email
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;
    await sendTeamInvitation({
      email,
      teamName: team.name,
      inviterName,
      inviteUrl,
    });
    console.log("after send email");


    return invitation;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to create invitation");
  }
}

export async function acceptInvitation(token: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  console.log('###### ACCEPT INVITATIONNNN ####')
  console.log(token)

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { team: true },
  });

  console.log('###### ACCEPT INVITATIONNNN 2####')


  if (!invitation) {
    throw new Error("Invalid invitation");
  }

  if (invitation.acceptedAt) {
    throw new Error("Invitation already accepted");
  }

  if (invitation.expiresAt < new Date()) {
    throw new Error("Invitation expired");
  }

  const user = await currentUser();

  console.log('###### ACCEPT INVITATIONNNN 3 ####')


  // Start a transaction to ensure data consistency
  const result = await prisma.$transaction(async (tx) => {
    // Create team member
    console.log('###### ACCEPT INVITATIONNNN 4####')

    let test = {
      teamId: invitation.teamId,
      userId,
      email: invitation.email,
      role: invitation.role,
      name: "unset",
    }
    console.log(JSON.stringify(test))

    const member = await tx.teamMember.create({
      data: {
        teamId: invitation.teamId,
        userId,
        email: invitation.email,
        role: invitation.role,
        name: "unset",
      },
    });
    console.log('###### ACCEPT INVITATIONNNN 5####')

    // Mark invitation as accepted
    await tx.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });
    console.log('###### ACCEPT INVITATIONNNN 6####')


    return member;
  });

  return result;
}
