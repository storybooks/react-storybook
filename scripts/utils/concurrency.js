const os = require('os');

/**
 * The maximum number of concurrent tasks we want to have on some CLI and CI tasks.
 * The amount of CPUS minus one, arbitrary limited to 15 to not overload CI executors.
 * @type {number}
 */
const maxConcurrentTasks = Math.min(Math.max(1, os.cpus().length - 1), 15);

/**
 * Use a simple round robin to filter input data according to the CI node currently running the script
 * @param {Array} arrayOfData An array of anything you want
 * @returns {Array} An array containing only the data that shoud be used by current CI node.
 */
function filterDataForCurrentCircleCINode(arrayOfData) {
  const nodeIndex = +process.env.CIRCLE_NODE_INDEX || 0;
  const numberOfNodes = +process.env.CIRCLE_NODE_TOTAL || 1;

  return arrayOfData.filter((_, index) => index % numberOfNodes === nodeIndex);
}

module.exports = {
  maxConcurrentTasks,
  filterDataForCurrentCircleCINode,
};
