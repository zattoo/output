// const fs = require('fs');
const core = require('@actions/core');
// const util = require('util');

// const readFile = util.promisify(fs.readFile);
const {
    context,
    // getOctokit,
} = require('@actions/github');

const {
    getFolders,
} = require('./files');

const run = async () => {
    // const token = core.getInput('token', {required: true});
    // const octokit = getOctokit(token);

    const sources = core.getInput('sources', {required: true});
    const ignoreActionLabel = core.getInput('ignoreActionLabel');

    const repo = context.payload.repository.name;
    const owner = context.payload.repository.full_name.split('/')[0];
    const pullNumber = context.payload.pull_request.number;
    const labels = context.payload.pull_request.labels.map((label) => label.name);

    console.log({
        owner,
        repo,
        pullNumber,
    });

    try {
        // Ignore the action if -output label (or custom name) exists
        if (labels.includes(ignoreActionLabel)) {
            core.info(`Ignore the action due to label ${ignoreActionLabel}`);
            process.exit(0);
        }

        const folders = await getFolders(sources);

        console.log(folders);
    } catch (error) {
        core.setFailed(error.message);
    }
};

run();
