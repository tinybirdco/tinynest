import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface TeamInvitationEmailProps {
  email: string;
  teamName: string;
  inviterName: string;
  inviteUrl: string;
}

export async function sendTeamInvitation({
  email,
  teamName,
  inviterName,
  inviteUrl,
}: TeamInvitationEmailProps) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email send');
      return;
    }

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@tinynest.app',
      to: email,
      subject: `You've been invited to join ${teamName} on TinyNest`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Team Invitation</h1>
          <p>Hi there!</p>
          <p>${inviterName} has invited you to join the team "${teamName}" on TinyNest.</p>
          <p>Click the button below to accept the invitation:</p>
          <a href="${inviteUrl}" style="
            display: inline-block;
            background-color: #0070f3;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 24px 0;
          ">Accept Invitation</a>
          <p style="color: #666;">This invitation link will expire in 7 days.</p>
          <p style="color: #666;">If you don't want to join or received this by mistake, you can ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send invitation email:', error);
    throw new Error('Failed to send invitation email');
  }
}
