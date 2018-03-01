"use strict";
exports.__esModule = true;
// node $JALANGI_ROOT/src/js/commands/jalangi.js --inlineIID -- inlineSource --analysis ./checkDeadWrites.js $TESTFILE
var JALANGI_RUN = "/src/js/commands/jalangi.js";
var JALANGI_OPTS = "--inlineIID --inlineSource --analysis";
var child_process_1 = require("child_process");
var RunJalangi = /** @class */ (function () {
    function RunJalangi() {
        if (process.argv.length === 5) {
            // three arguments present, the jalangi path, the analysis file and the file to test
            this.jalangiPath = process.argv[2];
            this.jalangiAnalysisFile = process.argv[3];
            this.fileToTest = process.argv[4];
        }
        else {
            console.error(process.argv.length);
            throw new Error("Usage of IdentifyDeadWrites: node IdentifyDeadWrites JALANGI_PATH JALANGI_ANALYSES_FILE FileToTest");
        }
    }
    RunJalangi.prototype.run = function () {
        console.log("Running analyses: " + this.jalangiAnalysisFile);
        console.log("On file: " + this.fileToTest);
        return child_process_1.execSync("node " + this.jalangiPath + JALANGI_RUN + " " + JALANGI_OPTS + " " + this.jalangiAnalysisFile + " " + this.fileToTest).toString();
    };
    return RunJalangi;
}());
exports.RunJalangi = RunJalangi;
var run = new RunJalangi();
console.log(run.run());
