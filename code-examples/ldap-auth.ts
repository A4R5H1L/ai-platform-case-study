/**
 * LDAP Authentication Implementation
 * 
 * University Active Directory integration with auto-provisioning,
 * role derivation, and fallback handling.
 */

import ldap from 'ldapjs';
import { prisma } from '@/lib/prisma';

// ===== Type Definitions =====

interface LdapConfig {
    url: string;                    // ldap://ldap.example.com:389
    baseDN: string;                 // dc=university,dc=edu
    bindDN?: string;                // Service account DN (optional)
    bindPassword?: string;          // Service account password
    searchFilter: string;           // (uid={{username}})
    useTLS: boolean;
    timeout: number;                // Connection timeout in ms
    defaultEmailDomain?: string;    // @university.edu
}

interface LdapUser {
    username: string;
    email: string;
    displayName: string;
    groups: string[];
}

interface AuthResult {
    success: boolean;
    user?: LdapUser;
    error?: string;
}

// ===== Configuration =====

function getLdapConfig(): LdapConfig {
    return {
        url: process.env.LDAP_URL || 'ldap://localhost:389',
        baseDN: process.env.LDAP_BASE_DN || 'dc=example,dc=com',
        bindDN: process.env.LDAP_BIND_DN,
        bindPassword: process.env.LDAP_BIND_PASSWORD,
        searchFilter: process.env.LDAP_SEARCH_FILTER || '(uid={{username}})',
        useTLS: process.env.LDAP_USE_TLS === 'true',
        timeout: parseInt(process.env.LDAP_TIMEOUT || '5000'),
        defaultEmailDomain: process.env.LDAP_DEFAULT_EMAIL_DOMAIN,
    };
}

// ===== LDAP Client Management =====

/**
 * Create and configure LDAP client
 */
function createLdapClient(config: LdapConfig): ldap.Client {
    const client = ldap.createClient({
        url: config.url,
        timeout: config.timeout,
        connectTimeout: config.timeout,
    });

    // Error handling
    client.on('error', (err) => {
        console.error('LDAP client error:', err.message);
    });

    return client;
}

/**
 * Bind to LDAP server (authenticate connection)
 */
async function bindClient(
    client: ldap.Client,
    dn: string,
    password: string
): Promise<void> {
    return new Promise((resolve, reject) => {
        client.bind(dn, password, (err) => {
            if (err) {
                reject(new Error(`LDAP bind failed: ${err.message}`));
            } else {
                resolve();
            }
        });
    });
}

/**
 * Search for user in LDAP directory
 */
async function searchUser(
    client: ldap.Client,
    baseDN: string,
    filter: string
): Promise<ldap.SearchEntry | null> {
    return new Promise((resolve, reject) => {
        const opts: ldap.SearchOptions = {
            filter,
            scope: 'sub',
            attributes: ['uid', 'mail', 'cn', 'displayName', 'memberOf', 'givenName', 'sn'],
        };

        client.search(baseDN, opts, (err, res) => {
            if (err) {
                reject(new Error(`LDAP search failed: ${err.message}`));
                return;
            }

            let entry: ldap.SearchEntry | null = null;

            res.on('searchEntry', (e) => {
                entry = e;
            });

            res.on('error', (err) => {
                reject(new Error(`LDAP search error: ${err.message}`));
            });

            res.on('end', () => {
                resolve(entry);
            });
        });
    });
}

// ===== Main Authentication Function =====

/**
 * Authenticate user against LDAP and extract user info
 */
export async function authenticateWithLdap(
    username: string,
    password: string
): Promise<LdapUser | null> {
    const config = getLdapConfig();
    const client = createLdapClient(config);

    try {
        // Build search filter
        const filter = config.searchFilter.replace('{{username}}', ldap.escapeFn(username));

        // First, bind with service account to search (if configured)
        if (config.bindDN && config.bindPassword) {
            await bindClient(client, config.bindDN, config.bindPassword);
        }

        // Search for user
        const entry = await searchUser(client, config.baseDN, filter);
        if (!entry) {
            console.log(`LDAP: User not found: ${username}`);
            return null;
        }

        // Get user DN for authentication
        const userDN = entry.objectName;
        if (!userDN) {
            return null;
        }

        // Authenticate with user credentials
        await bindClient(client, userDN, password);

        // Extract attributes
        const getAttribute = (name: string): string => {
            const attr = entry.attributes.find((a) => a.type === name);
            return attr?.values?.[0]?.toString() || '';
        };

        const getAttributeArray = (name: string): string[] => {
            const attr = entry.attributes.find((a) => a.type === name);
            return attr?.values?.map((v) => v.toString()) || [];
        };

        // Build email if not present
        let email = getAttribute('mail');
        if (!email && config.defaultEmailDomain) {
            email = `${username}@${config.defaultEmailDomain}`;
        }

        // Get display name
        const displayName =
            getAttribute('displayName') ||
            getAttribute('cn') ||
            `${getAttribute('givenName')} ${getAttribute('sn')}`.trim() ||
            username;

        // Get groups for role derivation
        const groups = getAttributeArray('memberOf');

        return {
            username,
            email,
            displayName,
            groups,
        };
    } catch (error) {
        console.error('LDAP authentication failed:', error);
        return null;
    } finally {
        client.unbind();
    }
}

// ===== Role Derivation =====

/**
 * Derive user role from LDAP groups
 */
export function deriveRoleFromGroups(groups: string[]): 'student' | 'staff' | 'admin' {
    // Check for admin groups
    const adminPatterns = ['admin', 'administrator', 'it-staff'];
    if (groups.some((g) => adminPatterns.some((p) => g.toLowerCase().includes(p)))) {
        return 'admin';
    }

    // Check for staff groups
    const staffPatterns = ['staff', 'employee', 'faculty', 'teacher'];
    if (groups.some((g) => staffPatterns.some((p) => g.toLowerCase().includes(p)))) {
        return 'staff';
    }

    // Default to student
    return 'student';
}

// ===== User Provisioning =====

/**
 * Auto-provision or update user after LDAP authentication
 */
export async function provisionUser(ldapUser: LdapUser) {
    const role = deriveRoleFromGroups(ldapUser.groups);

    const user = await prisma.user.upsert({
        where: { username: ldapUser.username },
        update: {
            email: ldapUser.email,
            displayName: ldapUser.displayName,
            // Don't update role after initial creation (allow manual override)
        },
        create: {
            username: ldapUser.username,
            email: ldapUser.email,
            displayName: ldapUser.displayName,
            role,
        },
    });

    return user;
}

// ===== NextAuth Integration =====

/**
 * NextAuth credentials provider authorize function
 */
export async function authorize(
    credentials: { username: string; password: string } | undefined
): Promise<{ id: string; email: string; name: string; role: string } | null> {
    if (!credentials?.username || !credentials?.password) {
        return null;
    }

    // Authenticate against LDAP
    const ldapUser = await authenticateWithLdap(
        credentials.username,
        credentials.password
    );

    if (!ldapUser) {
        return null;
    }

    // Provision/update user in database
    const user = await provisionUser(ldapUser);

    return {
        id: user.id,
        email: user.email,
        name: user.displayName,
        role: user.role,
    };
}

// ===== Example NextAuth Configuration =====

/*
// In auth.ts:
import CredentialsProvider from 'next-auth/providers/credentials';
import { authorize } from '@/lib/ldap';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'University Account',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize,
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) token.role = user.role;
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) session.user.role = token.role;
      return session;
    },
  },
};
*/
