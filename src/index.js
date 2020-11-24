const fs = require('fs');
const core = require('@actions/core');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const {
    context,
    getOctokit,
} = require('@actions/github');

const {
    getFolders,
    getFilePaths,
} = require('./files');

const {
    combineBody,
    getPullRequestBody,
    updatePullRequestBody,
} = require('./utils');

const run = async () => {
    const content = [];
    const token = core.getInput('token', {required: true});
    const octokit = getOctokit(token);

    const sources = core.getInput('sources', {required: true});
    const ignoreActionLabel = core.getInput('ignoreActionLabel');

    const repo = context.payload.repository.name;
    const owner = context.payload.repository.full_name.split('/')[0];
    const pullNumber = context.payload.pull_request.number;
    const labels = context.payload.pull_request.labels.map((label) => label.name);

    try {
        // Ignore the action if -output label (or custom name) exists
        if (labels.includes(ignoreActionLabel)) {
            core.info(`Ignore the action due to label ${ignoreActionLabel}`);
            process.exit(0);
        }

        const folders = await getFolders(sources);

        await Promise.all(folders.map(async (path) => {
            const filePaths = await getFilePaths(path, 'md');
            await Promise.all(filePaths.map(async (filePath) => {
                const fileContent = await readFile(filePath, {encoding: 'utf-8'});
                if (fileContent) {
                    content.push(fileContent
                        .trim()
                        .concat('\n'));
                }
            }));
        }));

        const text = content
            .join('\n')
            .trim();

        if (text) {
            // Get PR body content
            const pullRequestBody = await getPullRequestBody({
                octokit,
                owner,
                repo,
                pullNumber,
            });

            updatePullRequestBody({
                octokit,
                owner,
                repo,
                pullNumber,
                body: combineBody(pullRequestBody, text),
            });
        }
    } catch (error) {
        core.setFailed(error.message);
    }
};

run();
