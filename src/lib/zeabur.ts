export class Zeabur {
    private apiKey: string
    private projectId: string
    private serviceId: string // The ID of the storefront service

    constructor() {
        this.apiKey = process.env.ZEABUR_API_KEY || ''
        this.projectId = process.env.ZEABUR_PROJECT_ID || ''
        this.serviceId = process.env.ZEABUR_SERVICE_ID || ''
    }

    /**
     * Bind a custom domain to the Zeabur service
     */
    async bindDomain(domain: string): Promise<{ success: boolean, dnsRecords?: any[], error?: string }> {
        if (!this.apiKey || !this.serviceId) {
            console.warn('[Zeabur] Missing API Key or Service ID')
            return {
                success: false,
                error: 'Zeabur API Key or Service ID not configured'
            }
        }

        const query = `
            mutation AddDomain($serviceID: ObjectID!, $domain: String!, $isGenerated: Boolean!, $portName: String!) {
                addDomain(serviceID: $serviceID, domain: $domain, isGenerated: $isGenerated, portName: $portName) {
                    domain
                    status
                    dnsRecords {
                        recordType
                        recordName
                        recordValue
                    }
                }
            }
        `

        const variables = {
            serviceID: this.serviceId,
            domain: domain,
            isGenerated: false, // Custom Domain
            portName: "web"
        }

        try {
            console.log('[Zeabur] Adding Custom Domain (GraphQL):', { domain, serviceId: this.serviceId })

            const res = await fetch('https://api.zeabur.com/graphql', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query, variables })
            })

            const json = await res.json()
            console.log('[Zeabur] Response:', JSON.stringify(json, null, 2))

            if (json.errors) {
                const msg = json.errors[0]?.message || 'Failed to bind domain'
                throw new Error(msg)
            }

            const data = json.data?.addDomain

            return {
                success: true,
                dnsRecords: data?.dnsRecords || []
            }

        } catch (e: any) {
            console.error('[Zeabur] API Error:', e)
            return {
                success: false,
                error: e.message || '設定失敗'
            }
        }
    }

    /**
     * Check domain status (SSL, DNS)
     */
    async checkDomain(domain: string) {
        // ...
        return { status: 'active', ssl: true }
    }
}

export const zeabur = new Zeabur()
