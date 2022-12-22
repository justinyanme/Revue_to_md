import { logger } from './log'
const log = logger(module)
import axios from 'axios'
import { REVUE_API, urlWithoutQuery } from './common'
import { setupConfig } from './config'

export interface RevueResponseIssue {
    id: number
    title: string
    html: string
    sent_at: Date
    description: string
    url: string
    active: boolean
}

export class RevueAPI {
    token: string

    constructor() {
        const config = setupConfig()
        this.token = config.revue.token
    }

    async getLatestIssue(): Promise<RevueResponseIssue | null> {
        const response = await axios.request({
            url: `${REVUE_API}/v2/issues/latest`,
            headers: {
                "Authorization": `Token ${this.token}`
            }
        })

        let responseIssues: RevueResponseIssue[] = []
        if (response.data && response.data.issue && Array.isArray(response.data.issue)) {
            responseIssues = response.data.issue

        } else {
            log.error(`Invalid revue response.`)
            return null
        }

        return responseIssues[0]
    }

    async getIssues(): Promise<RevueResponseIssue[]> {
        log.info(`fetching issues…`)
        const response = await axios.request({
            url: `${REVUE_API}/v2/issues`,
            headers: {
                "Authorization": `Token ${this.token}`
            }
        })

        let responseIssues: RevueResponseIssue[] = []
        if (Array.isArray(response.data)) {
            responseIssues = response.data

        } else {
            log.error(`Invalid revue response.`)
            return []
        }

        log.info(`issues coutn: ${responseIssues.length}`)
        return responseIssues
    }
}
export const revue = new RevueAPI()