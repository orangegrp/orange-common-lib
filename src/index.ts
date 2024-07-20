export * from "./logger.js"
export * from "./envcfg.js";
export * as ConfigApi from "./configApiTypes/api_v1.js"

export function sleep(time: number) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}