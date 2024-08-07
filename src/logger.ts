import chalk, { type ChalkInstance } from "chalk"
import util from "util";
import { environment } from "./envcfg.js";

interface Logger {
    /**
     * Creates a new logger under this logger
     * @param subname Name for the sublogger
     */
    sublogger(subname: string): Logger;
    /**
     * NO DISCORD LOGGING - Log a verbose message. (Gray Text)
     * @param msg Message content
     */
    verbose(msg: string): void;
    /**
     * Log a verbose message. (White Text)
     * @param msg Message content
     */
    log(msg: string): void;
    /**
     * Log a message indicating success. (Green Text)
     * @param msg Message content
     */
    ok(msg: string): void;
    /**
     * Log a message with importance. (Yellow Text)
     * @param msg Message content
     */
    warn(msg: string): void;
    /**
     * Log an error message. (Red Text)
     * @param msg Message content
     */
    error(msg: Error | string): void;
    /**
     * Log an informative message. (Blue Text)
     * @param msg Message content
     */
    info(msg: string): void;
    /**
     * Log an object directly. (any color, defaults to white)
     * @param msg any object
     */
    object(msg: any, color?: ChalkInstance): void;
}

class BaseLogger {
    /**
     * Array of past logs (if storelog is set to true)
     */
    logs: string[] = [];
    private _storelog = false;
    private _webhook: string | undefined;
    private webhook_queue: string[] = [];
    private webhook_interval: NodeJS.Timeout | undefined;

    /**
     * set to true to store logs
     */
    set storelog(value: boolean) {
        this._storelog = value;
    }
    /**
     * webhook url to log to
     */
    set webhook(value: string) {
        this._webhook = value;
        if (this.webhook_interval) clearInterval(this.webhook_interval);
        this.webhook_interval = setInterval(() => this.sendWebhook(), 2100);
    }

    /**
     * Callback, called every time something is logged
     * @param msg content of whatever is logged
     */
    onlog = (msg: String) => { }

    log(msg: string, prefix?: string, logWebhook = true, webui_level: "Verbose" | "Log" | "Error" | "Warning" = "Verbose") {
        const fullMsg = BaseLogger.formatdate + (prefix ? chalk.magenta(`[${prefix}] `) : "") + msg;
        this.dolog(fullMsg)
        if (logWebhook) this.logWebhook(fullMsg);
    }

    /**
     * logs a message without outputting to console
     */
    silentLog(msg: string, prefix?: string) {
        const fullMsg = BaseLogger.formatdate + (prefix ? chalk.magenta(`[${prefix}] `) : "") + msg;
        this.dolog(fullMsg, true);
        this.logWebhook(fullMsg);
    }
    private dolog(msg: string, nolog = false) {
        if (!nolog)
            console.log(msg)
        if (this._storelog) {
            this.logs.push(msg)
            if (this.logs.length > 50) {
                this.logs.shift()
            }
        }
        this.onlog(msg);
    }
    private logWebhook(msg: string) {
        this.webhook_queue.push(msg);
    }

    private sendWebhook() {
        if (this.webhook_queue.length < 1 || !this._webhook) {
            return;
        }

        const next_msg = this.webhook_queue.splice(0, 1).at(0);

        if (next_msg != undefined) {
            fetch(new URL(this._webhook), {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: `\`\`\`ansi\n${next_msg.split('\`\`\`').join('`​`​`')}\`\`\`` })
            }).then(async (response) => {
                if (!response.status.toString().startsWith("2")) {
                    this.log(`Failed to send log to Discord: ${response.status} ${response.statusText}, re-queuing...`, "logger", false, "Verbose");
                    this.webhook_queue.push(`${next_msg}`);
                }
            }).catch((err) => {
                this.log(`Failed to send log to Discord: ${err}, WILL NOT try re-queuing...`, "logger", false);
            });
        }
    }
    private static get formatdate() {
        return chalk.cyan(`[ ${new Date().toISOString()}] `);
    }
}

const logger = new BaseLogger();

(async()  => {
    if (environment.DISCORD_WEBHOOK_LOGGER_URL)
        logger.webhook = environment.DISCORD_WEBHOOK_LOGGER_URL;
})();


class PrefixLogger implements Logger {
    private prefix: string;
    constructor(prefix: string) {
        this.prefix = prefix;
    }

    log(msg: string) {
        logger.log(msg, this.prefix, true, "Log");
    }
    error(msg: Error | string) {
        if (typeof (msg) != "string") {
            msg = util.inspect(msg, { depth: null });
        }
        logger.log(chalk.red(msg), this.prefix, true, "Error");
    }
    warn(msg: string) {
        logger.log(chalk.yellow(msg), this.prefix, true, "Warning");
    }
    sublogger(subname: string) {
        return new PrefixLogger(this.prefix + " > " + subname)
    }
    info(msg: string) {
        logger.log(chalk.blue(msg), this.prefix, true, "Log");
    }
    verbose(msg: string) {
        logger.log(chalk.gray(msg), this.prefix, false, "Verbose");
    }
    ok(msg: string) {
        logger.log(chalk.green(msg), this.prefix, true, "Log");
    }
    object(msg: any, color: ChalkInstance = chalk.white) {
        logger.silentLog(color(util.inspect(msg, { depth: null })));
        logger.log("", this.prefix, false);
        console.log(msg);
    }
}

/**
 * Creates a new logger and returns it
 * @param prefix A Prefix (module name) to use for the logger, will be displayed in logs before the message
 * @returns { Logger }
 */
function getLogger(prefix: string): Logger {
    return new PrefixLogger(prefix)
}

export { logger, getLogger }
export type { PrefixLogger, BaseLogger, Logger };