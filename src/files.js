const util = require('util');
const glob = require('glob');

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
            folders.push(source);
        }
    }

    return folders;
};

module.exports = {
    getFolders,
};
