const {glob} = require('glob');

/**
 * List all folders specified in sources
 *
 * @param {string} [sources]
 * @returns {Promise<string[]>}
 */
const getFolders = async (sources) => {
    /** Use root directory if sources is not defined */
    if (!sources) {
        return [''];
    }

    /** @type {string[]} */
    const folders = [];

    await Promise.all(sources.split(/, */g).map(async (source) => {
        if (glob.hasMagic(source)) {
            folders.push(...await glob(source.endsWith('/') ? source : `${source}/`));
        } else {
            folders.push(!source.endsWith('/') ? `${source}/` : source);
        }
    }));

    return folders;
};

/**
 * Gives an array with the paths
 * of the files matching the extension
 * in the given folder
 *
 * @param {string} folder
 * @param {string} extension
 * @returns {Promise<string[]>}
 */
const getFilePaths = (folder, extension) => {
    return glob(`${folder}*.${extension}`);
};

module.exports = {
    getFilePaths,
    getFolders,
};
