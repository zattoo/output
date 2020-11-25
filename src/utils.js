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
 * Cleans the previous body and attaches the new information
 * @param {string} previousBody
 * @param {string} text
 * @returns {string}
 */
const combineBody = (previousBody, text) => {
    if (/<!-- output start -->(.|\n)*<!-- output end -->/gi.test(previousBody)) {
        return previousBody
            .replace(/<!-- output start -->(.|\n)*<!-- output end -->/gi, `<!-- output start -->\n${text}\n<!-- output end -->`)
            .trim();
    } else {
        return previousBody
            .trim()
            .concat('\n\n')
            .concat(`<!-- output start -->\n${text}\n<!-- output end -->`);
    }
};

module.exports = {
    combineBody,
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
