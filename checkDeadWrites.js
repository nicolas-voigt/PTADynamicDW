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
// Author: Kai-Nico Nase, Nicolas Voigt

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
            readHook(J$.iidToLocation(J$.sid, iid), name, isScriptLocal);
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
            writeHook(J$.iidToLocation(J$.sid, iid), name, isScriptLocal);
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
        this.getFieldPre = function(iid, base, offset, isComputed, isOpAssign, isMethodCall) {
            //console.log(iid + ":getfieldPre:  base:" + JSON.stringify(base) + " isComputed:" + isComputed + " isOpAssign:" + isOpAssign + " isMethodCall:" + isMethodCall);
        };
        /**
         * 
         * @param {number} iid the static instruction ID
         * @param {object} base the base object
         * @param {string|*} offset the property (name? or the property itself?)
         * @param {*} val the value to be stored 
         * @param {boolean} isComputed if the property is written using []
         * @param {boolean} isOpAssign True if the operation is of the form o.p op= e (TODO: check that)
         */
        this.putFieldPre = function(iid, base, offset, val, isComputed, isOpAssign) {
            //console.log(iid + ":putFieldPre: base:" + JSON.stringify(base) + " offset:" + offset + " val:" + val + " isComputed:" + isComputed + " isOpAssign:" + isOpAssign);
        };
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
            declareHook(J$.iidToLocation(J$.sid, iid), name, val, isArgument);
        };
        /**
         * 
         * @param {number} iid  the call IID
         * @param {function} f the function object
         * @param {*} dis the "this" variable value
         * @param {Array} args the function arguments
         */
        this.functionEnter = function (iid, f, dis, args){
            FunctionEnterHook(J$.iidToLocation(J$.sid, iid), f, dis, args);
        };
        /**
         * 
         * @param {number} iid the call IID
         * @param {*} returnVal the value returned by the function
         * @param {Object|undefined} wrappedExceptionVal if an exception was raised, else undefined
         */
        this.functionExit = function(iid, returnVal, wrappedExceptionVal){
            FunctionExitHook(J$.iidToLocation(J$.sid, iid),returnVal, wrappedExceptionVal);
        };

        this.endExecution = function() {
            EndExecutionHook();
        };
        /**
         * 
         * @param {number} iid the call IID
         * @param {function} f the function object called
         * @param {*} base the base (receiver) object
         * @param {array} args the arguments array
         * @param {boolean} isConstructor true if a new object is instanciated
         * @param {boolean} isMethod true if this function is a method (member of an object)
         * @param {number} functionIid the unique function IID
         * @param {number} functionSid static IID that will match the functionEnter hook
         */
        this.invokeFunPre = function(iid, f, base, args, isConstructor, isMethod, functionIid, functionSid) {
            invokeFunPreHook(J$.iidToLocation(J$.sid, iid), f, base, args, isConstructor, isMethod, functionIid, functionSid);
        };
    }
    sandbox.analysis = new MyAnalysis();
})(J$);

// node $JALANGI_ROOT/src/js/commands/jalangi.js --inlineIID -- inlineSource --analysis ./checkDeadWrites.js $TESTFILE
"use strict";
var MemoryFrame = /** @class */ (function () {
    /**
     * MemoryFrame constructor
     * @param {Object} parent the parent frame (if any)
     * @param {number} ID the frame ID
     * @param {number} subID the frame subID (if it is a child of another frame, this argument is used by addChild())
     * @see MemoryFrame.addChildFrame()
     */
    function MemoryFrame(parent, ID, subID) {
        if (subID === void 0) { subID = 0; }
        if (parent === undefined) {
            // first frame
            this.m_parent = undefined;
        }
        else {
            this.m_parent = parent;
        }
        this.m_ID = ID;
        this.m_SubID = subID;
        this.m_childs = new Array();
        this.m_variables = new Array();
        this.m_subFrameID = 0; // start at 0 for all subframes
        this.m_frameEnded = false;
    }
    /**
     * @returns {number} the frame ID
     */
    MemoryFrame.prototype.ID = function () {
        if (this.m_ID === undefined) {
            return "Frame Error";
        }
        else {
            return this.m_ID.toString() + ":" + this.m_SubID.toString();
        }
    };
    /**
     * @returns {boolean} if the frame is ended
     */
    MemoryFrame.prototype.isFrameEnded = function () {
        return this.m_frameEnded;
    };
    /**
     * Creates a child frame and returns it
     * @param {number} frameSID the frame SID (or unique call ID)
     * @returns {Object} the created child frame
     */
    MemoryFrame.prototype.addChildFrame = function (frameSID) {
        var tmp = new MemoryFrame(this, frameSID, this.m_subFrameID++);
        this.m_childs.push(tmp);
        return tmp;
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
            returnValue = returnValue.concat(variable.deadwrites());
        }
        return returnValue;
    };
    /**
     * main variable call
     * @param {string} name the variable name
     * @param {number} iid the call IID
     * @param {boolean|undefined} readOrWrite true if read, false if write, undefined if variable declaration
     */
    MemoryFrame.prototype.variableEvent = function (name, iid, readOrWrite) {
        var variable = this.variableExists(name);
        if (variable === undefined) {
            // the variable is not found, creating a new one
            if (name === "Object") {
                //console.log(iid + ":Object found, creating a frame");
                this.addChildFrame(iid);
            }
            else {
                variable = new Variable(name);
                this.m_variables.push(variable);
                //console.log("variable " + name + " created in frame " + this.ID());
            }
        }
        if (variable === undefined) {
            // do not init a variable that is an object, it has to stay trapped
        }
        else if (readOrWrite === undefined) {
            // do nothing, the variable is just defined for later
            variable.init(iid);
        }
        else if (readOrWrite) {
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
            //console.log("deadwrites for " + variable.name() + ":" + variable.deadwrites().toString());
            retValue = retValue.concat(variable.deadwrites());
        }
        // Terminate all the child frames
        //var frame: MemoryFrame;
        /*for (frame of currentFrame.childs()){
            if (!frame.isFrameEnded()) {
                console.log("Frame " + frame.ID() + " is not ended");
                retValue = retValue.concat(frame.endFrame());
            }
        }*/
        this.m_frameEnded = true;
        //console.log("Deadwrites for frame " + this.ID() + ": " + retValue.toString());
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
            //console.log(iid + ":variable " + this.name() + " read (over read)");
        }
        if (this.m_lastIsWritten) {
            // read over write, everything is ok
            this.m_lastIsWritten = false;
            //console.log(iid + ":variable " + this.name() + " read (over write)");
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
            //console.log(iid + ":variable " + this.name() + " written (over read)");
            this.m_lastIsRead = false;
        }
        else if (this.m_lastIsWritten && this.m_initIID !== undefined && this.m_LastWritten !== undefined) {
            // write over write, dynamic dead write !
            //console.log(iid + ":variable " + this.name() + " written (over write) dynamic deadwrite !");
            this.m_deadwrites.push(new DeadWrite(this.name(), this.m_initIID, this.m_LastWritten.IID(), iid));
        }
        else {
            // first write after the declaration
            //console.log(iid + ": variable " + this.name() + " written for the first time");
        }
        this.m_LastWritten = new VariableEvent(iid);
        this.m_lastIsWritten = true;
    };
    Variable.prototype.init = function (iid) {
        this.m_initIID = iid;
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
        //console.log("End for variable " + this.name() + " lastIsRead: " + this.m_lastIsRead + " lastIsWritten: " + this.m_lastIsWritten);
        if (this.m_lastIsWritten && this.m_initIID !== undefined && this.m_LastWritten !== undefined) {
            // the last call is a write, this is a deadwrite
            //console.log("static deadwrite for variable " + this.name());
            this.m_deadwrites.push(new DeadWrite(this.name(), this.m_initIID, this.m_LastWritten.IID(), undefined));
        }
        if (!this.m_lastIsRead && !this.m_lastIsWritten && this.m_initIID !== undefined) {
            // the variable was defined, but never used
            //console.log("variable " + this.name() + " was declared but never used");
            this.m_deadwrites.push(new DeadWrite(this.name(), this.m_initIID, undefined, undefined));
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
     * @param {string} name the variable name
     * @param {number} initIID the variable initialisation IID
     * @param {number} dw1 the first call
     * @param {number} dw2 the second call
     */
    function DeadWrite(name, initIID, dw1, dw2) {
        this.name = name;
        this.initIID = initIID;
        if (dw1 === undefined && dw2 === undefined) {
            this.iid1 = -1;
            this.iid2 = -1; // both set to -1 for unused variable
        }
        else if (dw1 !== undefined && dw2 === undefined) {
            this.iid2 = -1; // -1 equals to end of execution, static deadwrite
            this.iid1 = dw1;
        }
        else if (dw1 !== undefined && dw2 !== undefined) {
            this.iid2 = dw2;
            this.iid1 = dw1;
        }
        else {
            this.iid1 = 0; // error in creating the DeadWrite
            this.iid2 = 0;
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
    DeadWrite.prototype.toString = function () {
        if (this.iid1 === -1 && this.iid2 === -1) {
            //return "[Variable: \"" + this.name + "\" init: " + this.initIID + " ] unused variable";
            return this.initIID + " unused variable " + this.name;
        }
        else if (this.iid2 !== -1) {
            return this.iid2 + " dynamic deadwrite for " + this.name;
            //return "[Variable: \"" + this.name + "\" init: " + this.initIID + " ] Dynamic deadwrite found at position " + this.iid2 + " (source: " + this.iid1 + " )";
        }
        else {
            return this.iid1 + " static deadwrite for " + this.name;
            //return "[Variable: \"" + this.name + "\" init: " + this.initIID + " ] Static deadwrite found at position " + this.iid1;
        }
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
    //TODO it depends on the iid to decide if it's a child frame, or if it exists already (@see invokeFunPre)
    //currentFrame = new MemoryFrame(currentFrame, frameID++); // create a new frame
    //console.log("frame " + frameID + " started")
    console.log("FunctionEnterHook not implemented");
}
/**
 * Hook for the FunctionExit jalangi callback
 * @param {number} iid the call IID
 * @param {*} returnVal the value returned by the function
 * @param {Object|undefined} wrappedExceptionVal if an exception was raised, else undefined
 */
function FunctionExitHook(iid, returnVal, wrappedExceptionVal) {
    // end the frame and show the deadwrites
    var deadwrites = currentFrame.endFrame();
    var dw;
    console.log("Deadwrites for frame " + currentFrame.ID() + ": " + deadwrites.length);
    //console.log(deadwrites.toString());
    for (var _i = 0, deadwrites_1 = deadwrites; _i < deadwrites_1.length; _i++) {
        dw = deadwrites_1[_i];
        console.log(dw.toString());
    }
    // reset the frame to the parent before resuming
    var parentFrame = currentFrame.getParent();
    if (parentFrame !== undefined) {
        currentFrame = parentFrame;
    }
    //console.log("FunctionExitHook not implemented");
}
/**
 * Hook for the EndExecution jalangi callback
 */
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
/**
 *
 * @param {number} iid the call IID
 * @param {string} name the variable name
 * @param {*} val the variable value
 * @param {boolean} isArgument true if the variable is a function argument
 */
function declareHook(iid, name, val, isArgument) {
    currentFrame.variableEvent(name, iid, undefined);
}
/**
  *
  * @param {number} iid the call IID
  * @param {function} f the function object called
  * @param {*} base the base (receiver) object
  * @param {array} args the arguments array
  * @param {boolean} isConstructor true if a new object is instanciated
  * @param {boolean} isMethod true if this function is a method (member of an object)
  * @param {number} functionIid the unique function IID
  * @param {number} functionSid static IID that will match the functionEnter hook
  */
function invokeFunPreHook(iid, f, base, args, isConstructor, isMethod, functionIid, functionSid) {
    if (isMethod) {
        // function is a object member, it is a child of the currentFrame
        if (functionSid !== undefined && functionIid !== undefined) {
            currentFrame = currentFrame.addChildFrame(functionSid); // add a new child frame
        }
        else {
            // native code was called, trapping this
        }
        //console.log("new method call !");
        // functionSid will be the IID given at FunctionEnterHook to find the frame
    }
    if (isConstructor) {
        //console.log("new object created ! " + iid + " " + f + " " + base + " " + functionIid + " " + functionSid);
    }
}
