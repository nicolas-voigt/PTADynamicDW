/*   This file is part of PTADynamicDW.
 *
 *   PTADynamicDW is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   PTADynamicDW is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with PTADynamicDW.  If not, see <http://www.gnu.org/licenses/>.
 */
// Author: Kai Hase, Nicolas Voigt

// do not remove the following comment
// JALANGI DO NOT INSTRUMENT

(function (sandbox) {
    function MyAnalysis () {
        /**
         * Executed at each variable read
         * @param {number} iid the static instruction ID
         * @param {string} name the variable name
         * @param {*} val the value stored in the variable
         * @param {boolean} isGlobal if the var is not declared using var (TODO: check the meaning)
         * @param {boolean} isScriptLocal if the var is declared global unsing var
         */
        this.read = function(iid, name, val, isGlobal, isScriptLocal) {
            readHook(iid, name, isScriptLocal);
        };
        /**
         * Executed at each variable write
         * @param {number} iid the static instruction IID
         * @param {string} name the variable name
         * @param {*} val the value to store
         * @param {*} lhs the value stored before in the variable
         * @param {boolean} isGlobal if the var is not declared using var (TODO: check the meaning)
         * @param {boolean} isScriptLocal if the var is declared global unsing var
         */
        this.write = function(iid, name, val, lhs, isGlobal, isScriptLocal) {
            writeHook(iid, name, isScriptLocal);
        };
        /**
         * 
         * @param {number} iid the static instruction ID
         * @param {object} base the base object
         * @param {string|*} offset the property (name? or the property itself?)
         * @param {boolean} isComputed if the property is accessed using []
         * @param {boolean} isOpAssign True if the operation is of the form o.p op= e (TODO: check that)
         * @param {boolean} isMethodCall if the property is accessed using () (method call)
         */
        this.getFieldPre = function(iid, base, offset, isComputed, isOpAssign, isMethodCall) {};
        /**
         * 
         * @param {number} iid the static instruction ID
         * @param {object} base the base object
         * @param {string|*} offset the property (name? or the property itself?)
         * @param {*} val the value to be stored 
         * @param {boolean} isComputed if the property is written using []
         * @param {boolean} isOpAssign True if the operation is of the form o.p op= e (TODO: check that)
         */
        this.putFieldPre = function(iid, base, offset, val, isComputed, isOpAssign) {};
        /**
         * 
         * @param {number} iid  the statuc instruction ID
         * @param {object} name the variable name
         * @param {*} val the value
         * @param {boolean} isArgument is true is the variable is arguments or a formal parameter
         * @param {number} argumentIndex the argument index (start 0) or -1 if not a formal parameter
         * @param {boolean} isCatchParam is true if the variable is a parameter of a catch statement
         */
        this.declare = function(iid, name, val, isArgument, argumentIndex, isCatchParam) {
        };
        /**
         * 
         * @param {number} iid  the call IID
         * @param {function} f the function object
         * @param {*} dis the "this" variable value
         * @param {Array} args the function arguments
         */
        this.functionEnter = function (iid, f, dis, args){
            FunctionEnterHook(iid, f, dis, args);
        };
        /**
         * 
         * @param {number} iid the call IID
         * @param {*} returnVal the value returned by the function
         * @param {Object|undefined} wrappedExceptionVal if an exception was raised, else undefined
         */
        this.functionExit = function(iid, returnVal, wrappedExceptionVal){
            FunctionExitHook(iid,returnVal, wrappedExceptionVal);
        };

        this.endExecution = function() {
            EndExecutionHook();
        };
    }
    sandbox.analysis = new MyAnalysis();
})(J$);

// node $JALANGI_ROOT/src/js/commands/jalangi.js --inlineIID -- inlineSource --analysis ./checkDeadWrites.js $TESTFILE

var MemoryFrame = /** @class */ (function () {
    /**
     * MemoryFrame constructor
     * @param {Object} parent the parent frame (if any)
     * @param {number} ID the frame ID
     */
    function MemoryFrame(parent, ID) {
        if (parent === undefined) {
            // first frame
        }
        else {
            this.m_parent = parent;
        }
        this.m_ID = ID;
        this.m_childs = new Array();
        this.m_variables = new Array();
    }
    /**
     * @returns {number} the frame ID
     */
    MemoryFrame.prototype.ID = function () {
        return this.m_ID;
    };
    /**
     * @returns {boolean} if the frame is ended
     */
    MemoryFrame.prototype.isFrameEnded = function () {
        return this.m_frameEnded;
    };
    /**
     * @returns {Array} all the childs MemoryFrames
     */
    MemoryFrame.prototype.childs = function () {
        return this.m_childs;
    };
    /**
     * @returns {Array} all the actual deadwrites
     */
    MemoryFrame.prototype.deadwrites = function () {
        var variable;
        var returnValue = new Array();
        for (var _i = 0, _a = this.m_variables; _i < _a.length; _i++) {
            variable = _a[_i];
            returnValue.concat(variable.deadwrites());
        }
        return returnValue;
    };
    /**
     * main variable call
     * @param {string} name the variable name
     * @param {number} iid the call IID
     * @param {boolean} readOrWrite true if read, false if write
     */
    MemoryFrame.prototype.variableEvent = function (name, iid, readOrWrite) {
        var variable = this.variableExists(name);
        if (variable === undefined) {
            // the variable is not found, creating a new one
            variable = new Variable(name);
            this.m_variables.push(variable);
            console.log("variable " + name + " created in frame " + this.ID());
        }
        if (readOrWrite) {
            // read
            variable.read(iid);
        }
        else {
            // write
            variable.written(iid);
        }
    };
    /**
     *
     * @param {string} name the variable name
     * @returns {Object|boolean} the variable or undefined if it doesn't exist
     */
    MemoryFrame.prototype.variableExists = function (name) {
        var tmp;
        for (var _i = 0, _a = this.m_variables; _i < _a.length; _i++) {
            tmp = _a[_i];
            if (tmp.name() === name) {
                return tmp;
            }
        }
        return undefined;
    };
    /**
     * @returns {Object} the parent memoryframe
     */
    MemoryFrame.prototype.getParent = function () {
        return this.m_parent;
    };
    /**
     * @return {Array} all the deadwrites of the frame (static and dynamic)
     */
    MemoryFrame.prototype.endFrame = function () {
        var variable;
        var retValue = new Array();
        if (this.m_frameEnded) {
            console.log("WARNING: frame already ended !");
        }
        for (var _i = 0, _a = this.m_variables; _i < _a.length; _i++) {
            variable = _a[_i];
            variable.frameEnd();
            retValue.concat(variable.deadwrites());
        }
        // Terminate all the child frames
        var frame;
        for (var _b = 0, _c = currentFrame.childs(); _b < _c.length; _b++) {
            frame = _c[_b];
            if (!frame.isFrameEnded()) {
                console.log("Frame " + frame.ID() + " is not ended");
                retValue.concat(frame.endFrame());
            }
        }
        this.m_frameEnded = true;
        return retValue;
    };
    return MemoryFrame;
}());
/**
 * This class represents a variable
 */
var Variable = /** @class */ (function () {
    /**
     * Creates a variable
     * @param {string} name the variable name
     */
    function Variable(name) {
        this.m_name = name;
        this.m_lastIsRead = false;
        this.m_lastIsWritten = false;
        this.m_deadwrites = new Array();
    }
    /**
     * hook when this variable is read
     * @param {number} iid the IID of the read
     */
    Variable.prototype.read = function (iid) {
        if (this.m_lastIsRead) {
            // read over read, everything is ok
            console.log("variable " + this.name() + " read (over read)");
        }
        if (this.m_lastIsWritten) {
            // read over write, everything is ok
            this.m_lastIsWritten = false;
            console.log("variable " + this.name() + " read (over write)");
        }
        this.m_LastRead = new VariableEvent(iid);
        this.m_lastIsRead = true; // set last to read
    };
    /**
     * hook when this variable is written
     * @param {number} iid the IID of the write
     */
    Variable.prototype.written = function (iid) {
        if (this.m_lastIsRead) {
            // write over read, everything is ok
            console.log("variable " + this.name() + " written (over read)");
            this.m_lastIsRead = false;
        }
        if (this.m_lastIsWritten) {
            // write over write, dynamic dead write !
            console.log("variable " + this.name() + " written (over write) dynamic deadwrite !");
            this.m_deadwrites.push(new DeadWrite(this.m_LastWritten.IID(), iid));
        }
        this.m_LastWritten = new VariableEvent(iid);
        this.m_lastIsWritten = true;
    };
    /**
     * @returns {Object} the qualified deadwrites
     */
    Variable.prototype.deadwrites = function () {
        return this.m_deadwrites;
    };
    /**
     * @returns {string} the variable name
     */
    Variable.prototype.name = function () {
        return this.m_name;
    };
    /**
     * Needs to be called at the frame end to detect the static deadwrites
     */
    Variable.prototype.frameEnd = function () {
        if (this.m_lastIsWritten) {
            // the last call is a write, this is a deadwrite
            this.m_deadwrites.push(new DeadWrite(this.m_LastWritten.IID(), undefined));
        }
    };
    return Variable;
}());
/**
 * This class represents an event in the variable
 * A read or a write of example
 */
var VariableEvent = /** @class */ (function () {
    /**
     * VariableEvent constructor
     * @param {number} iid the code ID
     */
    function VariableEvent(iid) {
        this.m_IID = iid;
    }
    /**
     * @returns {number} the code ID
     */
    VariableEvent.prototype.IID = function () {
        return this.m_IID;
    };
    return VariableEvent;
}());
/**
 * This class represents a deadwrite
 */
var DeadWrite = /** @class */ (function () {
    /**
     * Deadwrite constructor
     * @param {number} dw1 the first call
     * @param {number} dw2 the second call
     */
    function DeadWrite(dw1, dw2) {
        this.iid1 = dw1;
        if (dw2 === undefined) {
            this.iid2 = -1; // -1 equals to end of execution, static deadwrite
        }
        else {
            this.iid2 = dw2;
        }
    }
    /**
     * @returns {number} the deadwrite source (first call)
     */
    DeadWrite.prototype.DeadwriteSource = function () {
        return this.iid1;
    };
    /**
     * @returns {number} the deadwrite position (last call)
     */
    DeadWrite.prototype.DeadwriteDetected = function () {
        return this.iid2;
    };
    return DeadWrite;
}());
var frameID = 0;
var mainFrame = new MemoryFrame(undefined, frameID++);
var currentFrame = mainFrame;
/**
 * Hook for the read event
 * @param {number} iid the code IID
 * @param {string} name the variable name
 * @param {boolean} isScriptLocal true if the variable is in the global scope
 */
function readHook(iid, name, isScriptLocal) {
    if (isScriptLocal) {
        mainFrame.variableEvent(name, iid, true);
    }
    else {
        currentFrame.variableEvent(name, iid, true);
    }
}
/**
 * Hook for the write event
 * @param {number} iid the code IID
 * @param {string} name the variable name
 * @param {boolean} isScriptLocal true if the variable is in the global scope
 */
function writeHook(iid, name, isScriptLocal) {
    if (isScriptLocal) {
        mainFrame.variableEvent(name, iid, false);
    }
    else {
        currentFrame.variableEvent(name, iid, false);
    }
}
function getFieldPreHook() {
}
function putFieldPreHook() {
}
/**
 *
 * @param {number} iid the call IID
 * @param {function} f the function contents
 * @param {*} dis the value of the "this" variable
 * @param {Array} args the function arguments
 */
function FunctionEnterHook(iid, f, dis, args) {
    currentFrame = new MemoryFrame(currentFrame, frameID++); // create a new frame
    console.log("frame " + frameID + " started");
}
/**
 *
 * @param {number} iid the call IID
 * @param {*} returnVal the value returned by the function
 * @param {Object|undefined} wrappedExceptionVal if an exception was raised, else undefined
 */
function FunctionExitHook(iid, returnVal, wrappedExceptionVal) {
    // end the frame and show the deadwrites
    var deadwrites = currentFrame.endFrame();
    console.log("Deadwrites for frame " + currentFrame.ID() + ": " + deadwrites.length);
    console.log(deadwrites);
    // reset the frame to the parent before resuming
    currentFrame = currentFrame.getParent();
}
function EndExecutionHook() {
    if (currentFrame !== mainFrame) {
        // something happened ?!
        console.log("an error occured, the frames are not clean");
        console.log("current frame: " + currentFrame.ID());
        console.log("main frame: " + mainFrame.ID());
    }
    else {
        FunctionExitHook(0, undefined, undefined); // call the exit frame for the main frame
    }
}
