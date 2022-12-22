import * as winston from 'winston'
import * as Transport from 'winston-transport'
import * as path from 'path'
import * as util from 'util'
import config = require('config')

const logLevel: string = config.get('log.level')
const hostname: string = config.get('log.hostname')

const transports: Array<Transport> = [
    new winston.transports.Console({
        level: logLevel,
        format: winston.format.combine(
            winston.format(info => {
                if (process.env.NODE_ENV !== 'production') {
                    // DEBUG
                } else {
                    info.hostname = hostname;
                    info.pid = process.pid;
                }
                info.level = info.level.toUpperCase();
                return info;
            })(),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss,SSSS' }),
            winston.format.ms(),
            winston.format.colorize(),
            winston.format.printf((meta) => {
                let msg = meta.message
                if (typeof (msg) == 'object' || Array.isArray(msg)) {
                    msg = util.inspect(msg)
                }

                if (process.env.NODE_ENV !== 'production') {
                    // DEBUG
                    return `${meta.timestamp.split(" ")[1].split(",")[0]} ${meta.level}: ${msg}`

                } else {
                    // PRODUCTION
                    return `${meta.timestamp} ${meta.level} ${meta.hostname} ${meta.pid} (${meta.ms}): ${msg}`
                }
            }),
        )
    })
]

const logger = winston.createLogger({
    level: logLevel,
    format: winston.format.combine(
        winston.format.label({ label: path.basename(process.cwd()) }),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] })
    ),
    transports: transports,
});
logger.debug("Logger initiated.")
logger.debug(`Log level: ${config.get('log.level')}`)

const wrapper = function (module: any = null) {
    let filename = module ? module.filename : ""
    filename = filename.replace(".js", "")
    filename = `[${path.basename(filename)}]`
    return {
        info: function (msg: any, overrideName: string = "") {
            if (overrideName.length > 0) {
                filename = `[${overrideName}]`
            }
            logger.info(`${filename} ${msg}`)
        },
        debug: function (msg: any, overrideName: string = "") {
            if (overrideName.length > 0) {
                filename = `[${overrideName}]`
            }
            logger.debug(`${filename} ${msg}`)
        },
        warn: function (msg: any, overrideName: string = "") {
            if (overrideName.length > 0) {
                filename = `[${overrideName}]`
            }
            logger.warn(`${filename} ${msg}`)
        },
        error: function (msg: any, overrideName: string = "") {
            if (overrideName.length > 0) {
                filename = `[${overrideName}]`
            }
            logger.error(`${filename} ${msg}`)
        }
    }
}

// export { logger as log }
export { wrapper as logger }