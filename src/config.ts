import * as fs from 'fs-extra'
import * as path from 'path'

export interface IConfig {
    log: {
        level: string,
        hostname: string
    },
    revue: {
        token: string
    }
}

export function setupConfig(): IConfig {
    const configJson = path.resolve(process.cwd(), 'config.json')
    if (!fs.existsSync(configJson)) {
        throw new Error(`Failded to setup config. Please make sure config.json file exist.`);
    }

    try {
        const buff = fs.readFileSync(configJson)
        const config = JSON.parse(buff.toString())
        return config

    } catch (error) {
        throw new Error(`Failded to setup config. Please make sure config.json file exist.`);
    }
}