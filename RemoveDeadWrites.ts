import * as identityDeadWrites from './IdentityDeadWrites';
import * as esprima from "esprima";
import * as estraverse from "estraverse";
import * as escodegen from "escodegen";
import * as fs from "fs";
import * as path from "path";

const identify = new identityDeadWrites.RunJalangi();
const fileToCheck = fs.readFileSync(identify.getFileToTest(),'utf-8');
const filePath = path.resolve(identify.getFileToTest());

/**
 * Helper class for DeadWriteLocation
 * @see DeadWriteLocation
 */
class codeLocation {
    line: number;
    column: number;
}
/**
 * This class structure is done to match the location object in esprima
 */
class DeadWriteLocation {
    public start: codeLocation;
    public end: codeLocation;
    constructor(lineBegin: number, columnBegin: number, lineEnd: number, columnEnd: number) {
        this.start = new codeLocation();
        this.end = new codeLocation();
        this.start.column = columnBegin;
        this.start.line = lineBegin;
        this.end.column = columnEnd;
        this.end.line = lineEnd;
    }
}

function getDeadWritesFromOutput(input: string): DeadWriteLocation[] {
    const lines: string[] = input.split('\n'); // split all lines
    const result: DeadWriteLocation[] = new Array<DeadWriteLocation>(); // initialising the result
    const jalangiIdentifier: string = '(' + filePath;
    var line: string // the current line
    for (line of lines) {
        if (line.startsWith(jalangiIdentifier)) {
            // this line is a Deadwrite output
            // A Output line looks like this: (D:\Uni\PTA\tests\level1.js:32:9:32:11) static deadwrite for h
            // we split the closing parenthesis, and then by the ':' character, the numbers define:
            // 4: line begin
            // 3: column begin
            // 2: line end
            // 1: column end (counting from the end)
            let temp = line.split(')')[0].split(":");
            result.push(new DeadWriteLocation(Number(temp[temp.length - 4]),
                                              Number(temp[temp.length - 3]),
                                              Number(temp[temp.length - 2]),
                                              Number(temp[temp.length - 1])));
        }
    }
    
    return result;
}
function removeDeadWrites(syntaxTree: esprima.Program, deadwritesLocations: DeadWriteLocation[]): string {
    let syntaxTreeTemp = syntaxTree;
    estraverse.replace(syntaxTreeTemp, {enter: (node) => {
        var deadWrite: DeadWriteLocation;
        for (deadWrite of deadwritesLocations) {
            if (deadWrite.end.line === node.loc.end.line && deadWrite.end.column === node.loc.end.column) {
                    console.log("Removed line " + deadWrite.end.line);
                    return estraverse.VisitorOption.Remove; // remove the node from the AST
                }
            }
    }});
    return escodegen.generate(syntaxTreeTemp);
}

const syntaxTree = esprima.parseScript(fileToCheck, {loc: true});
const deadwrites = getDeadWritesFromOutput(identify.run());

const result: string = removeDeadWrites(syntaxTree, deadwrites);
console.log("Result: " + result);