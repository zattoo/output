const outputRegex = /<!-- output start -->(.|\n)*<!-- output end -->/i;

/**
 * Returns the body of the given pull request
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
 * @param {string} commentBody
 * @returns {string}
 */
const hasOutput = (commentBody) => {
    return outputRegex.test(commentBody);
};

/**
 * Cleans the previous output and attaches the new information
 * @param {string} previousBody - comment in the pull request
 * @param {string} [outputText] - without content will clean the previous output
 * @returns {string}
 */
const combineBody = (previousBody, outputText) => {
    if (hasOutput(previousBody)) {
        return previousBody.replace(
            outputRegex,
            outputText ? `<!-- output start -->\n${outputText}\n<!-- output end -->` : '',
        ).trim();
    } else {
        return outputText
            ? previousBody
                .trim()
                .concat(`\n<!-- output start -->\n${outputText}\n<!-- output end -->`)
            : previousBody;
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
 * @prop {Function} octokit
 * @prop {string} owner
 * @prop {string} repo
 * @prop {number} pullNumber
 */

/**
  * @typedef {Object} UpdatePullRequest
  * @param {string} body
  */
