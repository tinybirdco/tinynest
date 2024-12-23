import dynamic from 'next/dynamic';

export type ToolState = 'available' | 'installed' | 'configured';

export interface AppGridItem {
    id: string;
    ds: string;
    name: string;
    description: string;
    icon: string;
}

export const TOOLS: Record<string, AppGridItem> = {
    // Mail
    resend: {
        id: 'resend',
        ds: 'resend',
        name: 'Resend',
        description: 'Email delivery service',
        icon: '📨'
    },
    mailgun: {
        id: 'mailgun',
        ds: 'mailgun',
        name: 'Mailgun',
        description: 'Email delivery service',
        icon: '📨'
    },
    // Auth
    clerk: {
        id: 'clerk',
        ds: 'clerk',
        name: 'Clerk',
        description: 'Authentication and user management',
        icon: '🔐'
    },
    auth0: {
        id: 'auth0',
        ds: 'auth0',
        name: 'Auth0',
        description: 'Identity platform',
        icon: '🔐'
    },
    // Hosting
    vercel_logs: {
        id: 'vercel_logs',
        ds: 'vercel_logs',
        name: 'Vercel Logs',
        description: 'Deployment and serverless logs',
        icon: '🧱'
    },
    vercel: {
        id: 'vercel',
        ds: 'vercel',
        name: 'Vercel',
        description: 'Deployment and serverless',
        icon: '🧱'
    },
    // VCS
    gitlab: {
        id: 'gitlab',
        ds: 'gitlab',
        name: 'Gitlab',
        description: 'Source code management',
        icon: '🦊'
    },
    github: {
        id: 'github',
        ds: 'github',
        name: 'Github',
        description: 'Source code management',
        icon: '🦊'
    },
    // Payment & billing
    orb: {
        id: 'orb',
        ds: 'orb',
        name: 'Orb',
        description: 'Usage-based billing',
        icon: '💰'
    },
    stripe: {
        id: 'stripe',
        ds: 'stripe',
        name: 'Stripe',
        description: 'Payment processing',
        icon: '💰'
    },
    // Notifications
    knock: {
        id: 'knock',
        ds: 'knock',
        name: 'Knock',
        description: 'Push notifications',
        icon: '🔔'
    },
    pagerduty: {
        id: 'pagerduty',
        ds: 'pagerduty',
        name: 'Pagerduty',
        description: 'Notifications',
        icon: '🔔'
    },
    // Logging
    sentry: {
        id: 'sentry',
        ds: 'sentry',
        name: 'Sentry',
        description: 'Error logging',
        icon: '👀'
    },
};

export const TOOL_IMPORTS = {
    clerk: {
        Dashboard: dynamic(() => import('@/components/tools/clerk/dashboard')),
        Readme: dynamic(() => import('@/components/tools/clerk/readme')),
    },
    resend: {
        Dashboard: dynamic(() => import('@/components/tools/resend/dashboard')),
        Readme: dynamic(() => import('@/components/tools/resend/readme')),
    },
    auth0: {
        Dashboard: dynamic(() => import('@/components/tools/auth0/dashboard')),
        Readme: dynamic(() => import('@/components/tools/auth0/readme')),
    },
    orb: {
        Dashboard: dynamic(() => import('@/components/tools/orb/dashboard')),
        Readme: dynamic(() => import('@/components/tools/orb/readme')),
    },
    gitlab: {
        Dashboard: dynamic(() => import('@/components/tools/gitlab/dashboard')),
        Readme: dynamic(() => import('@/components/tools/gitlab/readme')),
    },
    vercel_logs: {
        Dashboard: dynamic(() => import('@/components/tools/vercel_logs/dashboard')),
        Readme: dynamic(() => import('@/components/tools/vercel_logs/readme')),
    },
} as const;

export type ToolId = keyof typeof TOOL_IMPORTS;