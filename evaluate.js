var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');

var EVALUATE_COMMAND = 'java -cp bin/example-1.3-SNAPSHOT.jar org.jpmml.evaluator.EvaluationExample';

/**
 * @param {String} modelFilepath
 * @param {String} csvFilepath
*/
module.exports = function evaluate(modelFilepath, csvFilepath) {
  var tmpOutputFilepath;

  var csvBasename = path.basename(csvFilepath);

  var lastIndexDot = csvBasename.lastIndexOf('.');
  if (lastIndexDot !== -1) {
    tmpOutputFilepath = csvBasename.substr(0, lastIndexDot) + '-output.csv';
  } else {
    tmpOutputFilepath = csvBasename + '-output.csv';
  }

  return new Promise(function (resolve, reject) {
    exec(`${EVALUATE_COMMAND} --model ${modelFilepath} --input ${csvFilepath} --output ${tmpOutputFilepath}`, function (err, res) {
      if (err) {
        reject(err);
        return;
      }

      fs.readFile(tmpOutputFilepath, 'utf8', function (err, res) {
        if (err) {
          reject(err);
          return;
        }

        resolve(res.toString());
      });
    });
  });
};