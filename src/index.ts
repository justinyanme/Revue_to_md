import { logger } from './log'
const log = logger(module)
import * as yargs from 'yargs'
import { downloadImages, extractImageUrlsFromHtml, isValidString, saveIssueToMD } from './common'
import { revue } from './RevueAPI'
import * as fs from 'fs-extra'
import * as path from 'path'
import { setupConfig } from './config'

async function exportSubscriberList(argv: { [key: string]: any }) {
    log.info(`exportSubscriberList: ${JSON.stringify(argv)}`)

    const config = setupConfig()
    const token = config.revue.token
    if (!isValidString(token)) {
        log.error(`invalid token.`)
        return
    }

    const subscribers = await revue.getSubscribers()
    const outFolder = path.resolve(process.cwd(), 'out')
    if (!fs.existsSync(outFolder)) {
        await fs.mkdir(outFolder)
        log.info(`created out folder.`)
    }

    try {
        const jsonPath = path.resolve(outFolder, 'subscribers.json')
        await fs.writeFile(jsonPath, JSON.stringify(subscribers))
        log.info(`Exported at: ${jsonPath}`)

    } catch (error) {
        log.error(error)
    }
}

async function listIssues(argv: { [key: string]: any }) {
    log.info(`listIssues: ${JSON.stringify(argv)}`)

    const config = setupConfig()
    const token = config.revue.token
    if (!isValidString(token)) {
        log.error(`invalid token.`)
        return
    }

    const responseIssues = await revue.getIssues()

    for (let i = 0; i < responseIssues.length; i++) {
        const respIssue = responseIssues[i];
        log.debug(`${respIssue.title}`)
    }
}

async function saveIssues(argv: { [key: string]: any }) {
    log.info(`saveIssues: ${JSON.stringify(argv)}`)

    const includeImages = argv["images"]
    log.debug(`includeImages: ${includeImages}`)

    const config = setupConfig()
    const token = config.revue.token
    if (!isValidString(token)) {
        log.error(`invalid token.`)
        return
    }

    const outFolder = path.resolve(process.cwd(), 'out')
    if (!fs.existsSync(outFolder)) {
        await fs.mkdir(outFolder)
        log.info(`created out folder.`)
    }

    const responseIssues = await revue.getIssues()

    for (let i = 0; i < responseIssues.length; i++) {
        const respIssue = responseIssues[i];
        log.info(`Saving ${respIssue.title}???`)

        const urls = await extractImageUrlsFromHtml(respIssue.html)
        log.debug(`Images: ${urls}`)

        try {
            await downloadImages(urls, outFolder)

            const mdPath = await saveIssueToMD(respIssue, outFolder)
            log.info(`Saved at ${mdPath}`)

        } catch (error) {
            log.error(error)
            continue
        }
    }

    const dataJsonPath = path.resolve(outFolder, `data.json`)
    await fs.writeFile(dataJsonPath, JSON.stringify(responseIssues))
}

yargs
    .scriptName("index")
    .usage('$0 <cmd> [args]')
    .command('listIssues', 'List all issues from revue', () => {
        return yargs.options({})
    }, listIssues)
    .command('saveInMD', 'Save all issues in markdown format', () => {
        return yargs.options({
            i: {
                alias: 'images',
                default: false,
                describe: "auto download all images from issues",
                type: 'boolean',
            },
        })
    }, saveIssues)
    .command('exportSubscriberList', 'Export all subscribers to out/subscribers.json', () => {
        return yargs.options({
        })
    }, exportSubscriberList)
    .demandCommand(1, '')
    .help()
    .showHelpOnFail(true)
    .argv