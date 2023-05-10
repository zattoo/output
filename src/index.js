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
} = require('./files.js');

const {
    combineBody,
    getPullRequestBody,
    hasOutput,
    updatePullRequestBody,
} = require('./utils.js');

const run = async () => {
    const token = core.getInput('token', {required: true});
    const octokit = getOctokit(token);

    const sources = core.getInput('sources', {required: true});
    const name = core.getInput('name', {required: true});
    const top = core.getInput('top', {required: false}) === 'true';

    const repo = context.payload.repository.name;
    const owner = context.payload.repository.full_name.split('/')[0];
    const pullNumber = context.payload.pull_request.number;

    try {
        const pullRequest = {
            octokit,
            owner,
            repo,
            pullNumber,
        };
        /** @type {string[]} */
        const outputContent = [];
        const folders = await getFolders(sources);

        await Promise.all(folders.map(async (path) => {
            const filePaths = await getFilePaths(path, 'md');

            await Promise.all(filePaths.map(async (filePath) => {
                const fileContent = await readFile(filePath, {encoding: 'utf-8'});

                if (fileContent) {
                    outputContent.push(fileContent.trim());
                }
            }));
        }));

        const pullRequestBody = await getPullRequestBody(pullRequest);

        core.debug(JSON.stringify({folders}));
        core.debug(JSON.stringify({outputContent}));
        core.debug(JSON.stringify({pullRequestBody}));

        if (outputContent.length) {
            const body = combineBody({
                name,
                top,
                previousBody: pullRequestBody,
                outputText: outputContent.join('\n'),
            });

            core.info('Adding output to PR comment');
            core.debug(JSON.stringify({body}));

            await updatePullRequestBody({
                ...pullRequest,
                body,
            });
        } else if (hasOutput(name, pullRequestBody)) {
            const body = combineBody({
                name,
                previousBody: pullRequestBody,
            });

            core.info('Cleaning output from PR comment');
            core.debug(JSON.stringify({body}));

            await updatePullRequestBody({
                ...pullRequest,
                body,
            });
        } else {
            core.info('Doing nothing, comment does not need new output or clean up');
        }
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }

        console.error(error);
    }
};

run();
