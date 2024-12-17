"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTeam } from "@/context/team-context";
import { useState } from "react";

export default function TeamSettingsPage() {
  const { currentTeam, inviteMember, removeMember, updateMemberRole } = useTeam();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");

  const handleInvite = async () => {
    try {
      await inviteMember(email, role);
      setEmail("");
      setRole("member");
    } catch (error) {
      console.error("Failed to invite member:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Team Settings</h1>
        <p className="text-muted-foreground">
          Manage your team members and permissions
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Team Members</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Email address"
                type="email"
                className="max-w-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Select value={role} onValueChange={(value: "admin" | "member") => setRole(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleInvite}>Invite</Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTeam?.members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Select 
                        value={member.role}
                        onValueChange={(value: "admin" | "member") => 
                          updateMemberRole(member.id, value)
                        }
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500"
                        onClick={() => removeMember(member.id)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Team Settings</h2>
          <div className="space-y-4 max-w-md">
            <div className="space-y-2">
              <label className="text-sm font-medium">Team Name</label>
              <Input 
                placeholder="Enter team name" 
                value={currentTeam?.name || ""}
                onChange={() => {}} // TODO: Implement team name update
              />
            </div>
            <Button>Save Changes</Button>
          </div>
        </Card>

        <Card className="p-6 border-red-200">
          <h2 className="text-xl font-semibold mb-4 text-red-500">Danger Zone</h2>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Deleting your team will remove all associated data and cannot be undone.
            </p>
            <Button variant="destructive">Delete Team</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
