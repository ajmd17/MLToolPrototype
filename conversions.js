var exec = require('child_process').exec;

var JPMML_SKLEARN_COMMAND = 'java -jar ./bin/converter-executable-1.3-SNAPSHOT.jar';

module.exports = {
  /**
   * TODO: This will be a lambda function or something
   * @param {String} inputFilepath
   * @param {String} outputFilepath
   */
  sklearnPickle2PMML: function (inputFilepath, outputFilepath) {
    return new Promise(function (resolve, reject) {
      exec(`${JPMML_SKLEARN_COMMAND} --pmml-output ${outputFilepath} --pkl-input ${inputFilepath}`, function (err, res) {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }
};