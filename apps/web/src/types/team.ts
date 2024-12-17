export type TeamRole = 'admin' | 'member';

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  email: string;
  name: string;
  joinedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  members: TeamMember[];
}
