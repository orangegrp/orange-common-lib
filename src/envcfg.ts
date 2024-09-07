import dotenv from "dotenv";
import chalk from "chalk";
import { createClient } from "@supabase/supabase-js";

const envData: OrangeEnvCfg = {};

function log(msg: string, level: "Verbose" | "Log" | "Error" | "Warning" | "Success" = "Verbose") {
    if (level == "Verbose") console.log(chalk.cyan(`[ ${new Date().toISOString()}]`), chalk.gray("[MINILOG]"), chalk.gray(msg));
    if (level == "Log") console.log(chalk.cyan(`[ ${new Date().toISOString()}]`), chalk.gray("[MINILOG]"), chalk.white(msg));
    if (level == "Error") console.log(chalk.cyan(`[ ${new Date().toISOString()}]`), chalk.gray("[MINILOG]"), chalk.red(msg));
    if (level == "Warning") console.log(chalk.cyan(`[ ${new Date().toISOString()}]`), chalk.gray("[MINILOG]"), chalk.yellow(msg));
    if (level == "Success") console.log(chalk.cyan(`[ ${new Date().toISOString()}]`), chalk.gray("[MINILOG]"), chalk.green(msg));
}

function initEnv(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        if (process.env) {
            let envs = [];
            let counter = 0;
            for (const key in process.env) {
                const envValue = process.env[key];
                if (envValue) {
                    envData[key] = envValue;
                    envs.push(key);
                    counter++;
                }
            }
            log(`Imported environment variables ${envs.join(", ")}`, "Verbose");
            log(`Loaded ${counter} environment variables!`, "Success");
        }

        const localVars = dotenv.config();

        if (localVars.parsed) {
            let envs = [];
            let counter = 0;
            for (const key in localVars.parsed) {
                process.env[key] = envData[key] = localVars.parsed[key];
                envs.push(key);
                counter++;
            }
            log(`Imported local environment variables ${envs.join(", ")}`, "Verbose");
            log(`Loaded ${counter} local (.env) environment variables!`, "Success");
        }

        if (!process.env.SUPABASE_SERVER) { log("SUPABASE_SERVER is not set!", "Error"); reject(false); return; };
        if (!process.env.SUPABASE_ANON_KEY) { log("SUPABASE_ANON_KEY is not set!", "Error"); reject(false); return; };

        const supabase = createClient(process.env.SUPABASE_SERVER, process.env.SUPABASE_ANON_KEY);

        if (!supabase) { log("Failed to connect to Supabase!", "Error"); reject(false); return; };
        if (!process.env.SUPABASE_USERNAME) { log("SUPABASE_USERNAME is not set!", "Error"); reject(false); return; };
        if (!process.env.SUPABASE_PASSWORD) { log("SUPABASE_PASSWORD is not set!", "Error"); reject(false); return; };

        const { error: signInError } = await supabase.auth.signInWithPassword({ email: process.env.SUPABASE_USERNAME, password: process.env.SUPABASE_PASSWORD });

        if (signInError) { log(`Failed to sign in to Supabase!`, "Error"); reject(signInError); return; }

        const { data: remoteVars, error } = await supabase.from(`orange_bot_environment_${process.env.NODE_ENV === "production" ? "prod" : "dev"}`).select("*");

        if (error) { log("Failed to load remote (Supabase) environment variables!", "Error"); reject(error); return; }

        if (remoteVars) {
            let envs = [];
            let counter = 0;
            for (const { key, value } of remoteVars) {
                if (process.env[key] !== undefined) {
                    log(`Remote environment variable conflicts with local one. The local one will take precedence: ${key}`, "Warning");
                    continue;
                }
                process.env[key] = envData[key] = value;
                envs.push(key);
                counter++;
            }
            log(`Imported remote environment variables ${envs.join(", ")}`, "Verbose");
            log(`Loaded ${counter} remote environment variables!`, "Success");
        }

        resolve(true);
    });
}

type OrangeEnvCfg = {
    [key: string]: string;
} & {
    STARTUP?: string;
    INSTANCE_NAME?: string;
    SUPABASE_SERVER?: string;
    SUPABASE_ANON_KEY?: string;
    SUPABASE_USERNAME?: string;
    SUPABASE_PASSWORD?: string;
    NODE_ENV?: string;
    DISCORD_WEBHOOK_LOGGER_URL?: string;
    BOT_TOKEN?: string;
    BOT_CLIENT?: string;
    FORCE_COLOR?: string;
    SSH_HOST?: string;
    SSH_PORT?: string;
    SSH_USER?: string;
    SSH_PASSWORD?: string;
    SSH_ROOT_USER?: string;
    SSH_ROOT_PASSWORD?: string;
    DEPLOY_GUILD?: string;
    DEPLOY_COMMANDS?: string;
    DEPLOY_GLOBAL?: string;
    CODERUNNER_API_KEY?: string;
    CODERUNNER_SERVER?: string;
    OPENCVE_USER?: string;
    OPENCVE_PASS?: string;
    JWT_SECRET_V1?: string;
    OPENAI_KEY?: string;
    PB_DOMAIN?: string;
    PB_USERNAME?: string;
    PB_PASSWORD?: string;
    OPENAI_INPUT_COST?: string;
    OPENAI_OUTPUT_COST?: string;
    OPENAI_DAILY_COST_CAP?: string;
    OPENAI_SHOW_PRICE?: string;
    SYS_PROMPT_TKS?: string;
    FNC_PROMPT_TKS?: string;
    SYS_PROMPT_PFX?: string;
}

export { envData as environment, initEnv, log as miniLog };