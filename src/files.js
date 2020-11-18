const glob = require('glob');
const util = require('util');

const globPromise = util.promisify(glob);

/**
 * List all folders specified in sources
 * @param {string} [sources]
 * @returns {Promise<string[]>}
 */
const getFolders = async (sources) => {
    /** Use root directory if sources is not defined */
    if (!sources) {
        return [''];
    }

    const folders = [];

    for await (const source of sources.split(/, */g)) {
        if (glob.hasMagic(source)) {
            folders.push(...await globPromise(source.endsWith('/') ? source : `${source}/`));
        } else {
            folders.push(!source.endsWith('/') ? `${source}/` : source);
        }
    }

    return folders;
};

/**
 * Gives an array with the paths
 * of the files matching the extension
 * in the given folder
 * @param {string} folder
 * @param {string} extension
 * @return {Promise<string[]>}
 */
const getFilePaths = (folder, extension) => {
    return globPromise(`${folder}*.${extension}`);
};

module.exports = {
    getFilePaths,
    getFolders,
};
