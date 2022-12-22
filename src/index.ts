import { logger } from './log'
const log = logger(module)
import * as yargs from 'yargs'
import * as config from 'config'
import { downloadImages, extractImageUrlsFromHtml, isValidString, saveIssueToMD } from './common'
import { revue } from './RevueAPI'
import * as fs from 'fs-extra'
import * as path from 'path'

async function listIssues(argv: { [key: string]: any }) {
    log.info(`listIssues: ${JSON.stringify(argv)}`)

    const token = config.get('revue.token')
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

    const token = config.get('revue.token')
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
        log.info(`Saving ${respIssue.title}…`)

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
    .demandCommand(1, '')
    .help()
    .showHelpOnFail(true)
    .argv