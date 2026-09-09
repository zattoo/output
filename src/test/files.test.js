const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const {
    getFilePaths,
    getFolders,
} = require('../files.js');

/**
 * Absolute path of the temporary fixtures directory
 *
 * @type {string}
 */
let root;

/**
 * Path of a fixture inside the temporary directory
 *
 * @param {string} [relativePath]
 * @returns {string}
 */
const fixture = (relativePath = '') => {
    return `${root}/${relativePath}`;
};

/**
 * Glob results have no guaranteed order
 *
 * @param {string[]} paths
 * @returns {string[]}
 */
const sorted = (paths) => {
    return [...paths].sort();
};

beforeAll(async () => {
    root = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'output-')));

    await Promise.all([
        fs.mkdir(fixture('projects/app/stats'), {recursive: true}),
        fs.mkdir(fixture('projects/embed/errors'), {recursive: true}),
    ]);

    await Promise.all([
        fs.writeFile(fixture('projects/app/stats/deps.md'), '### Deps'),
        fs.writeFile(fixture('projects/app/stats/size.md'), '### Size'),
        fs.writeFile(fixture('projects/app/stats/size.txt'), 'Size'),
        fs.writeFile(fixture('projects/embed/errors/errors.md'), '### Errors'),
        /** A file next to the project folders, to prove patterns only match directories */
        fs.writeFile(fixture('projects/readme.md'), '### Readme'),
    ]);
});

afterAll(async () => {
    await fs.rm(root, {
        recursive: true,
        force: true,
    });
});

describe('getFolders', () => {
    it('uses the root directory when there are no sources', async () => {
        expect(await getFolders()).toEqual(['']);
    });

    it('appends the trailing slash to a plain path', async () => {
        expect(await getFolders(fixture('projects/app/stats'))).toEqual([fixture('projects/app/stats/')]);
    });

    it('keeps the trailing slash of a plain path', async () => {
        expect(await getFolders(fixture('projects/app/stats/'))).toEqual([fixture('projects/app/stats/')]);
    });

    it('accepts a list of sources separated by commas', async () => {
        const sources = `${fixture('projects/app/stats/')},${fixture('projects/embed/errors/')}, ${fixture('projects/')}`;

        expect(sorted(await getFolders(sources))).toEqual(sorted([
            fixture('projects/app/stats/'),
            fixture('projects/embed/errors/'),
            fixture('projects/'),
        ]));
    });

    it('keeps a path that does not exist', async () => {
        expect(await getFolders(fixture('missing/'))).toEqual([fixture('missing/')]);
    });

    describe('glob patterns', () => {
        it('expands to the matching folders, with a trailing slash', async () => {
            expect(sorted(await getFolders(fixture('projects/*/')))).toEqual(sorted([
                fixture('projects/app/'),
                fixture('projects/embed/'),
            ]));
        });

        it('expands patterns without a trailing slash, ignoring files', async () => {
            expect(sorted(await getFolders(fixture('projects/*')))).toEqual(sorted([
                fixture('projects/app/'),
                fixture('projects/embed/'),
            ]));
        });

        it('supports single character wildcards', async () => {
            expect(await getFolders(fixture('projects/ap?/'))).toEqual([fixture('projects/app/')]);
        });

        it('supports ranges', async () => {
            expect(await getFolders(fixture('projects/[ae]pp/'))).toEqual([fixture('projects/app/')]);
        });

        it('expands to nothing when there are no matches', async () => {
            expect(await getFolders(fixture('missing/*/'))).toEqual([]);
        });
    });
});

describe('getFilePaths', () => {
    it('returns the files matching the extension', async () => {
        expect(sorted(await getFilePaths(fixture('projects/app/stats/'), 'md'))).toEqual(sorted([
            fixture('projects/app/stats/deps.md'),
            fixture('projects/app/stats/size.md'),
        ]));
    });

    it('ignores the files of other extensions', async () => {
        expect(await getFilePaths(fixture('projects/app/stats/'), 'txt')).toEqual([fixture('projects/app/stats/size.txt')]);
    });

    it('does not look into subfolders', async () => {
        expect(await getFilePaths(fixture('projects/embed/'), 'md')).toEqual([]);
    });

    it('returns nothing for a folder that does not exist', async () => {
        expect(await getFilePaths(fixture('missing/'), 'md')).toEqual([]);
    });
});

describe('getFolders and getFilePaths', () => {
    it('collects the files of every folder matching the pattern', async () => {
        const folders = await getFolders(fixture('projects/*/*/'));
        const filePaths = await Promise.all(folders.map((folder) => getFilePaths(folder, 'md')));

        expect(sorted(filePaths.flat())).toEqual(sorted([
            fixture('projects/app/stats/deps.md'),
            fixture('projects/app/stats/size.md'),
            fixture('projects/embed/errors/errors.md'),
        ]));
    });
});
