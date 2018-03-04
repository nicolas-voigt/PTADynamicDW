"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
var identityDeadWrites = __importStar(require("./IdentityDeadWrites"));
var esprima = __importStar(require("esprima"));
var estraverse = __importStar(require("estraverse"));
var escodegen = __importStar(require("escodegen"));
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var identify = new identityDeadWrites.RunJalangi();
var fileToCheck = fs.readFileSync(identify.getFileToTest(), 'utf-8');
var filePath = path.resolve(identify.getFileToTest());
/**
 * Helper class for DeadWriteLocation
 * @see DeadWriteLocation
 */
var codeLocation = /** @class */ (function () {
    function codeLocation(l, c) {
        this.line = l;
        this.column = c;
    }
    return codeLocation;
}());
/**
 * This class structure is done to match the location object in esprima
 */
var DeadWriteLocation = /** @class */ (function () {
    function DeadWriteLocation(lineBegin, columnBegin, lineEnd, columnEnd) {
        this.start = new codeLocation(lineBegin, columnBegin);
        this.end = new codeLocation(lineEnd, columnEnd);
    }
    return DeadWriteLocation;
}());
function getDeadWritesFromOutput(input) {
    var lines = input.split('\n'); // split all lines
    var result = new Array(); // initialising the result
    var jalangiIdentifier = '(' + filePath;
    var line; // the current line
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        line = lines_1[_i];
        if (line.startsWith(jalangiIdentifier)) {
            // this line is a Deadwrite output
            // A Output line looks like this: (D:\Uni\PTA\tests\level1.js:32:9:32:11) static deadwrite for h
            // we split the closing parenthesis, and then by the ':' character, the numbers define:
            // 4: line begin
            // 3: column begin
            // 2: line end
            // 1: column end (counting from the end)
            var temp = line.split(')')[0].split(":");
            result.push(new DeadWriteLocation(Number(temp[temp.length - 4]), Number(temp[temp.length - 3]), Number(temp[temp.length - 2]), Number(temp[temp.length - 1])));
        }
    }
    return result;
}
function removeDeadWrites(syntaxTree, deadwritesLocations) {
    var syntaxTreeTemp = syntaxTree;
    estraverse.replace(syntaxTreeTemp, { enter: function (node) {
            var deadWrite;
            for (var _i = 0, deadwritesLocations_1 = deadwritesLocations; _i < deadwritesLocations_1.length; _i++) {
                deadWrite = deadwritesLocations_1[_i];
                if (node.loc !== undefined && node.loc !== null && deadWrite.end.line === node.loc.end.line && deadWrite.end.column === node.loc.end.column) {
                    console.log("Removed line " + deadWrite.end.line);
                    return estraverse.VisitorOption.Remove; // remove the node from the AST
                }
            }
        } });
    return escodegen.generate(syntaxTreeTemp);
}
var syntaxTree = esprima.parseScript(fileToCheck, { loc: true });
var deadwrites = getDeadWritesFromOutput(identify.run());
var result = removeDeadWrites(syntaxTree, deadwrites);
console.log("Result: " + result);
