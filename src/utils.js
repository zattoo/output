/**
 *
 * @param {string} name
 * @returns {RegExp}
 */
const getOutputRegex = (name) => {
    return new RegExp(`<!-- output start - ${name} -->(.|\\r\\n|\\n)*<!-- output end - ${name} -->`, 'i');
};

/**
 * Returns the body of the given pull request
 *
 * @param {PullRequest} params
 */
const getPullRequestBody = async ({
    octokit,
    owner,
    repo,
    pullNumber,
}) => {
    const {data} = await octokit.pulls.get({
        owner,
        repo,
        pull_number: pullNumber,
    });

    return data.body;
};

/**
 * Updates the body of a pull request
 * with the given text
 *
 * @param {PullRequest & UpdatePullRequest} param
 */
const updatePullRequestBody = async ({
    octokit,
    owner,
    repo,
    pullNumber,
    body,
}) => {
    await octokit.pulls.update({
        owner,
        repo,
        pull_number: pullNumber,
        body,
    });
};

/**
 * Indicates if a text
 * contains the output block
 *
 * @param {string} name
 * @param {string} commentBody
 * @returns {boolean}
 */
const hasOutput = (name, commentBody) => {
    return getOutputRegex(name).test(commentBody);
};

/**
 * Cleans the previous output and attaches the new information
 *
 * @param {CombineBodyData} data
 * @returns {string}
 */
const combineBody = (data) => {
    const {
        previousBody,
        outputText,
        name,
    } = data;

    const output = `\n<!-- output start - ${name} -->\n${outputText}\n<!-- output end - ${name} -->`;

    if (hasOutput(name, previousBody)) {
        return previousBody.replace(
            getOutputRegex(name),
            outputText ? output : '',
        ).trim();
    } else if (!outputText) {
        return previousBody;
    } else if (data.top) {
        return output.concat(`\n${previousBody}`);
    } else {
        return previousBody.trim().concat(output);
    }
};

module.exports = {
    combineBody,
    hasOutput,
    getPullRequestBody,
    updatePullRequestBody,
};

/**
 * @typedef {Object} PullRequest
 * @prop {InstanceType<typeof GitHub>} octokit
 * @prop {string} owner
 * @prop {string} repo
 * @prop {number} pullNumber
 */

/**
 * @typedef {Object} UpdatePullRequest
 * @param {string} body
 */

/**
 * @typedef {Object} CombineBodyData
 * @prop {string} name - name of the output entity
 * @prop {string} previousBody - comment in the pull request
 * @prop {boolean} [top]
 * @prop {string} [outputText] - without content will clean the previous output
 */

/**
 * @typedef {import('@actions/github').GitHub} GitHub
 */
