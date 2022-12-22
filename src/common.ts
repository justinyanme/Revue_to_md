import { logger } from './log'
const log = logger(module)

import * as _ from 'lodash'
import * as cheerio from 'cheerio'
import { RevueResponseIssue } from './RevueAPI'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as TurndownService from 'turndown'
import axios from 'axios'

const turndownService = new TurndownService()

export const REVUE_API = 'https://www.getrevue.co/api'

export function isValidString(str: any) {
    return _.isString(str) && str.length > 0
}

export function urlWithoutQuery(urlStr: string) {
    let aUrl = new URL(urlStr)

    const realUrl = `${aUrl.protocol}//${aUrl.hostname}${aUrl.pathname}`
    return realUrl
}

export async function extractImageUrlsFromHtml(html: string): Promise<string[]> {
    if (!isValidString(html)) {
        return []
    }

    const $ = cheerio.load(html)

    let urls: string[] = []
    const imageTags = $('img')
    for (let i = 0; i < imageTags.length; i++) {
        const img = imageTags[i];
        if (isValidString($(img).attr('src'))) {
            urls.push($(img).attr('src'))
        }
    }
    return urls
}

export async function saveIssueToMD(respIssue: RevueResponseIssue, outFolder: string): Promise<string> {
    let md = turndownService.turndown(respIssue.html)
    if (!isValidString(md)) {
        throw new Error(`Failed to conver issue ${respIssue.title} to markdown.`);
    }

    // Insert title to the begging
    md = `# ${respIssue.title}\n` + md

    const mdPath = path.resolve(outFolder, `${respIssue.title.replace(/ /g, '_')}-${respIssue.id}.md`)
    await fs.writeFile(mdPath, md)
    return mdPath
}

export function isValidURLString(str: string) {
    if (!_.isString(str)) {
        return false
    }

    try {
        new URL(str)
        return true

    } catch (error) {
        return false
    }
}

async function downloadImage(url: string, outFolder: string): Promise<void> {
    const filename = path.basename(urlWithoutQuery(url))
    log.debug(`downloading filename: ${filename}`)

    const imageFolder = path.resolve(outFolder, 'images')
    if (!fs.existsSync(imageFolder)) {
        fs.mkdirSync(imageFolder)
    }

    const imagePath = path.resolve(imageFolder, filename)
    const writer = fs.createWriteStream(imagePath)

    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    })

    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
        writer.on('finish', () => {
            log.debug(`downloaded at ${imagePath}`)
            resolve()
        })
        writer.on('error', reject)
    })
}

export async function downloadImages(urls: string[], outFolder: string) {
    if (urls.length == 0) {
        return
    }

    for (let i = 0; i < urls.length; i++) {
        const aUrl = urls[i];
        if (!isValidURLString(aUrl)) {
            continue
        }

        await downloadImage(aUrl, outFolder)
    }
}