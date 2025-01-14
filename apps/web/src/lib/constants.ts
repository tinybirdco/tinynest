import dynamic from 'next/dynamic';

export const baseURL = (() => {
    // Preview deployments
    if (process.env.VERCEL_PUBLIC_ENV === 'preview') {
        return `https://${process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL}`;
    }

    // Production URL
    if (process.env.NEXT_PUBLIC_VERCEL_URL) {
        return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    }
    
    // Local development
    return 'http://localhost:3000';
})();

export type ToolState = 'available' | 'installed' | 'configured';

export interface AppGridItem {
    id: string;
    ds: string;
    name: string;
    description: string;
    icon: string;
    icon_url?: string;
}

export const TOOLS: Record<string, AppGridItem> = {
    // Mail
    resend: {
        id: 'resend',
        ds: 'resend',
        name: 'Resend',
        description: 'Email delivery service',
        icon: '📨',
        icon_url: '/resend_favicon.png'
    },
    mailgun: {
        id: 'mailgun',
        ds: 'mailgun',
        name: 'Mailgun',
        description: 'Email delivery service',
        icon: '📨',
        icon_url: '/mailgun_favicon.ico'
    },
    // Auth
    clerk: {
        id: 'clerk',
        ds: 'clerk',
        name: 'Clerk',
        description: 'Authentication and user management',
        icon: '🔐',
        icon_url: '/clerk_favicon.ico'
    },
    auth0: {
        id: 'auth0',
        ds: 'auth0',
        name: 'Auth0',
        description: 'Identity platform',
        icon: '🔐',
        icon_url: '/auth0_favicon.png'
    },
    // Hosting
    vercel_logs: {
        id: 'vercel_logs',
        ds: 'vercel_logs',
        name: 'Vercel Logs',
        description: 'Deployment and serverless logs',
        icon: '🧱',
        icon_url: '/vercel_favicon.ico'
    },
    vercel: {
        id: 'vercel',
        ds: 'vercel',
        name: 'Vercel',
        description: 'Deployment and serverless',
        icon: '🧱',
        icon_url: '/vercel_favicon.ico'
    },
    // VCS
    gitlab: {
        id: 'gitlab',
        ds: 'gitlab',
        name: 'Gitlab',
        description: 'Source code management',
        icon: '🦊',
        icon_url: '/gitlab_favicon.png'
    },
    github: {
        id: 'github',
        ds: 'github',
        name: 'Github',
        description: 'Source code management',
        icon: '🦊',
        icon_url: '/github_favicon.png'
    },
    // Payment & billing
    orb: {
        id: 'orb',
        ds: 'orb',
        name: 'Orb',
        description: 'Usage-based billing',
        icon: '💰',
        icon_url: '/orb_favicon.png'
    },
    stripe: {
        id: 'stripe',
        ds: 'stripe',
        name: 'Stripe',
        description: 'Payment processing',
        icon: '💰',
        icon_url: '/stripe_favicon.ico'
    },
    // Notifications
    knock: {
        id: 'knock',
        ds: 'knock',
        name: 'Knock',
        description: 'Push notifications',
        icon: '🔔',
        icon_url: '/knock_favicon.png'
    },
    pagerduty: {
        id: 'pagerduty',
        ds: 'pagerduty',
        name: 'Pagerduty',
        description: 'Notifications',
        icon: '🔔',
        icon_url: '/pagerduty_favicon.png'
    },
    // Logging
    sentry: {
        id: 'sentry',
        ds: 'sentry',
        name: 'Sentry',
        description: 'Error logging',
        icon: '👀',
        icon_url: '/sentry_favicon.ico'
    },
    // Links
    dub: {
        id: 'dub',
        ds: 'dub',
        name: 'Dub',
        description: 'Link infrastructure',
        icon: '👀',
        icon_url: '/dub_favicon.png'
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
    vercel: {
        Dashboard: dynamic(() => import('@/components/tools/vercel/dashboard')),
        Readme: dynamic(() => import('@/components/tools/vercel/readme')),
    },
    github: {
        Dashboard: dynamic(() => import('@/components/tools/github/dashboard')),
        Readme: dynamic(() => import('@/components/tools/github/readme')),
    },
    mailgun: {
        Dashboard: dynamic(() => import('@/components/tools/mailgun/dashboard')),
        Readme: dynamic(() => import('@/components/tools/mailgun/readme')),
    },
    stripe: {
        Dashboard: dynamic(() => import('@/components/tools/stripe/dashboard')),
        Readme: dynamic(() => import('@/components/tools/stripe/readme')),
    },
    sentry: {
        Dashboard: dynamic(() => import('@/components/tools/sentry/dashboard')),
        Readme: dynamic(() => import('@/components/tools/sentry/readme')),
    },
    knock: {
        Dashboard: dynamic(() => import('@/components/tools/knock/dashboard')),
        Readme: dynamic(() => import('@/components/tools/knock/readme')),
    },
    pagerduty: {
        Dashboard: dynamic(() => import('@/components/tools/pagerduty/dashboard')),
        Readme: dynamic(() => import('@/components/tools/pagerduty/readme')),
    },
    dub: {
        Dashboard: dynamic(() => import('@/components/tools/dub/dashboard')),
        Readme: dynamic(() => import('@/components/tools/dub/readme')),
    },
} as const;

export type ToolId = keyof typeof TOOL_IMPORTS;