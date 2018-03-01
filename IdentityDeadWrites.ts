// node $JALANGI_ROOT/src/js/commands/jalangi.js --inlineIID -- inlineSource --analysis ./checkDeadWrites.js $TESTFILE
const JALANGI_RUN: string = "/src/js/commands/jalangi.js"
const JALANGI_OPTS: string = "--inlineIID --inlineSource --analysis"
import {execSync} from "child_process";
export class RunJalangi{
    private jalangiAnalysisFile: string;
    private jalangiPath: string;
    private fileToTest: string;
    constructor() {
        if (process.argv.length === 5) {
            // three arguments present, the jalangi path, the analysis file and the file to test
            this.jalangiPath = process.argv[2];
            this.jalangiAnalysisFile = process.argv[3];
            this.fileToTest = process.argv[4];
        } else {
            console.error(process.argv.length);
            throw new Error("Usage of IdentifyDeadWrites: node IdentifyDeadWrites JALANGI_PATH JALANGI_ANALYSES_FILE FileToTest");
        }
    }
    getFileToTest(): string {
        return this.fileToTest;
    }
    run(): string {
        console.log("Running analyses: " + this.jalangiAnalysisFile);
        console.log("On file: " + this.fileToTest);
        return execSync("node " + this.jalangiPath + JALANGI_RUN + " " + JALANGI_OPTS + " " + this.jalangiAnalysisFile + " " + this.fileToTest).toString();
    }
}

const run = new RunJalangi();
console.log(run.run());
