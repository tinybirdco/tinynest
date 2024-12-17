"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import * as React from 'react'


export default function InvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = React.use(params)
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [status, setStatus] = useState<
    "loading" | "accepting" | "error" | "success"
  >("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      // Redirect to sign in, but preserve the invitation token
      router.push(`/sign-in?redirect_url=/invite/${token}`);
      return;
    }

    // Verify the invitation
    fetch(`/api/invitations/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setStatus("error");
        } else {
          setStatus("success");
        }
      })
      .catch((err) => {
        setError(err.message);
        setStatus("error");
      });
  }, [isLoaded, isSignedIn, token, router]);

  const acceptInvitation = async () => {
    setStatus("accepting");
    try {
      const res = await fetch(`/api/invitations/${token}/accept`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setStatus("error");
      } else {
        router.push("/app");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept invitation");
      setStatus("error");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="p-6">
          <p>Verifying invitation...</p>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Invalid Invitation</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-2">Team Invitation</h2>
        <p className="text-muted-foreground mb-4">
          You've been invited to join the team. Click below to accept the
          invitation.
        </p>
        <Button
          onClick={acceptInvitation}
          disabled={status === "accepting"}
        >
          {status === "accepting" ? "Accepting..." : "Accept Invitation"}
        </Button>
      </Card>
    </div>
  );
}
