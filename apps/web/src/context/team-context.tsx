'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import type { Team, TeamMember } from '@/types/team';
import { getTeams, createNewTeam, inviteTeamMember, updateTeamMemberRole, removeTeamMember } from '@/app/api/actions';

interface TeamContextType {
  teams: Team[];
  currentTeam: Team | null;
  setCurrentTeam: (team: Team) => void;
  createTeam: (name: string) => Promise<void>;
  inviteToTeam: (teamId: string, email: string, role: TeamMember["role"]) => Promise<void>;
  updateMemberRole: (teamId: string, memberId: string, role: TeamMember["role"]) => Promise<void>;
  removeMember: (teamId: string, memberId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      loadTeams();
    } else if (isLoaded && !user) {
      setIsLoading(false);
      setError('Not authenticated');
    }
  }, [user, isLoaded]);

  const loadTeams = async () => {
    try {
      setError(null);
      const loadedTeams = await getTeams();
      setTeams(loadedTeams);
      if (loadedTeams.length > 0 && !currentTeam) {
        setCurrentTeam(loadedTeams[0]);
      }
    } catch (error) {
      console.error('Failed to load teams:', error);
      setError(error instanceof Error ? error.message : 'Failed to load teams');
    } finally {
      setIsLoading(false);
    }
  };

  const createTeam = async (name: string) => {
    try {
      setError(null);
      const newTeam = await createNewTeam(name);
      setTeams(prev => [...prev, newTeam]);
      setCurrentTeam(newTeam);
    } catch (error) {
      console.error('Failed to create team:', error);
      setError(error instanceof Error ? error.message : 'Failed to create team');
      throw error;
    }
  };

  const inviteToTeam = async (teamId: string, email: string, role: TeamMember["role"]) => {
    try {
      setError(null);
      await inviteTeamMember(teamId, email, role);
      await loadTeams();
    } catch (error) {
      console.error('Failed to invite member:', error);
      setError(error instanceof Error ? error.message : 'Failed to invite member');
      throw error;
    }
  };

  const updateMemberRole = async (teamId: string, memberId: string, role: TeamMember["role"]) => {
    try {
      setError(null);
      await updateTeamMemberRole(teamId, memberId, role);
      await loadTeams();
    } catch (error) {
      console.error('Failed to update member role:', error);
      setError(error instanceof Error ? error.message : 'Failed to update member role');
      throw error;
    }
  };

  const removeMember = async (teamId: string, memberId: string) => {
    try {
      setError(null);
      await removeTeamMember(teamId, memberId);
      await loadTeams();
    } catch (error) {
      console.error('Failed to remove member:', error);
      setError(error instanceof Error ? error.message : 'Failed to remove member');
      throw error;
    }
  };

  return (
    <TeamContext.Provider
      value={{
        teams,
        currentTeam,
        setCurrentTeam,
        createTeam,
        inviteToTeam,
        updateMemberRole,
        removeMember,
        isLoading,
        error,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}
