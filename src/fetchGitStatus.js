const {
  spawnSync
} = require('child_process');

const {
  filterFiles
} = require('../src/filterFiles');

function fetchGitStatus(options) {
  let {
    baseBranch,
    diffFilter,
    formats
  } = options;

  let command = `git diff --relative --name-only --diff-filter=${diffFilter} ${baseBranch}...HEAD`;

  let [bin, ...args] = command.split(' ');

  return new Promise((resolve, reject) => {

    try {
      let commandOutput = spawnSync(bin, args);

      process.on('exit', function() {

        if (commandOutput.status) {
          let err = commandOutput.stderr.toString();

          if(err.includes('Not a git repository')) {
            err = 'Not a git repository';
          }

          reject(err);
        } else {
          let fileList = commandOutput.stdout.toString().split('\n');
          fileList = fileList.slice(0,-1); // While splitting there is an empty string at last position.

          if (formats) {
            fileList = filterFiles(fileList, formats);
          }

          resolve(fileList);
        }

      });

    } catch(err) {
      reject(err);
    }

  });

}

module.exports = {
  fetchGitStatus
};
