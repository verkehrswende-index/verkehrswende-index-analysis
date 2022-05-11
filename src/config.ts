import { promisify } from "util";
import fs from "fs";
import JSON5 from "json5";
const readFile = promisify(fs.readFile);

/**
 * Configuration of an area.
 */
type AreaConfig = {
    osm?: {
        extract: string;
        useFullExtract?: boolean;
        relationId: number;
    },
};

/**
 * The applicaiton's main configuration.
 */
type Configuration = {
    areas: {
        [id:string]: AreaConfig[],
    }
};

/**
 * Implements access to the JSON data.
 */
class Config {
    config: Configuration;

    constructor() {
    }

    /**
     * Reads the configuration as JSON5 from the given path.
     *
     * @param path The absolute file path.
     */
    async load(path: string) : Promise<void> {
        const configContent = (await readFile(path)).toString();
        this.config = JSON5.parse(configContent);
    }

    /**
     * Returns a copy of the configuration object.
     */
    get() : Configuration {
        return JSON.parse(JSON.stringify(this.config));
    }
}

export default Config;
