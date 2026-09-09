const fs = require('node:fs/promises');

/** Characters that turn a source into a glob pattern instead of a plain path */
const magicCharacters = /[*?[\]]/;

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
        /** A trailing slash restricts the matches to directories */
        const folder = source.endsWith('/') ? source : `${source}/`;

        if (magicCharacters.test(source)) {
            const matches = await Array.fromAsync(fs.glob(folder));

            folders.push(...matches.map((match) => `${match}/`));
        } else {
            folders.push(folder);
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
    return Array.fromAsync(fs.glob(`${folder}*.${extension}`));
};

module.exports = {
    getFilePaths,
    getFolders,
};
