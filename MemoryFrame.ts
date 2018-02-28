class MemoryFrame {
    /**
     * An array containing all the child frames
     */
    private m_childs: MemoryFrame[];
    /**
     * An array containing all the variables of this frame
     */
    private m_variables: Variable[];
    /**
     * A link to the parent frame
     */
    private m_parent: MemoryFrame;
    /**
     * The frame ID
     */
    private m_ID: number;
    /**
     * The frame subID
     */
    private m_SubID: number;
    /**
     * Is true if the frame is ended in memory (used for static deadwrites)
     */
    private m_frameEnded: boolean;
    /**
     * The subFrameID counter, used for the function addChildFrame()
     * @see MemoryFrame.addChildFrame()
     */
    private m_subFrameID: number;
    /**
     * MemoryFrame constructor
     * @param {Object} parent the parent frame (if any)
     * @param {number} ID the frame ID
     * @param {number} subID the frame subID (if it is a child of another frame, this argument is used by addChild())
     * @see MemoryFrame.addChildFrame()
     */
    constructor(parent: MemoryFrame, ID: number, subID: number = 0) {
        if (parent === undefined) {
            // first frame
        } else {
            this.m_parent = parent;
        }
        this.m_ID = ID;
        this.m_SubID = subID
        this.m_childs = new Array<MemoryFrame>();
        this.m_variables = new Array<Variable>();
        this.m_subFrameID = 0; // start at 0 for all subframes
    }
    /**
     * @returns {number} the frame ID
     */
    public ID(): string {
        return this.m_ID.toString() + ":" + this.m_SubID.toString()
    }
    /**
     * @returns {boolean} if the frame is ended
     */
    public isFrameEnded(): boolean {
        return this.m_frameEnded;
    }
    /**
     * Creates a child frame and returns it
     * @param {number} frameSID the frame SID (or unique call ID)
     * @returns {Object} the created child frame
     */
    public addChildFrame(frameSID: number): MemoryFrame {
        const tmp = new MemoryFrame(this, frameSID, this.m_subFrameID++);
        this.m_childs.push(tmp);
        return tmp;
    }
    /**
     * @returns {Array} all the childs MemoryFrames
     */
    public childs(): MemoryFrame[] {
        return this.m_childs;
    }
    /**
     * @returns {Array} all the actual deadwrites
     */
    public deadwrites(): DeadWrite[] {
        var variable: Variable;
        var returnValue: DeadWrite[] = new Array<DeadWrite>();
        for (variable of this.m_variables) {
            returnValue = returnValue.concat(variable.deadwrites());
        }
        return returnValue;
    }
    /**
     * main variable call
     * @param {string} name the variable name
     * @param {number} iid the call IID
     * @param {boolean|undefined} readOrWrite true if read, false if write, undefined if variable declaration
     */
    public variableEvent(name: string, iid: number, readOrWrite: boolean | undefined): void {
        let variable = this.variableExists(name);
        if (variable === undefined) {
            // the variable is not found, creating a new one
            if (name === "Object") {
                console.log(iid + ":Object found, creating a frame");
                this.addChildFrame(iid);
            } else {
                variable = new Variable(name);
                this.m_variables.push(variable);
                console.log("variable " + name + " created in frame " + this.ID());
            }
        }
        if (variable === undefined) {
            // do not init a variable that is an object, it has to stay trapped
        } else if (readOrWrite === undefined) {
            // do nothing, the variable is just defined for later
            variable.init(iid);
        } else if (readOrWrite) {
            // read
            variable.read(iid);
        } else {
            // write
            variable.written(iid);
        }
    }
    /**
     * 
     * @param {string} name the variable name
     * @returns {Object|boolean} the variable or undefined if it doesn't exist
     */
    public variableExists(name: string): Variable | undefined {
        var tmp: Variable;
        for(tmp of this.m_variables) {
            if (tmp.name() === name) {
                return tmp;
            }
        }
        return undefined;
    }
    /**
     * @returns {Object} the parent memoryframe
     */
    public getParent(): MemoryFrame {
        return this.m_parent;
    }
    /**
     * @return {Array} all the deadwrites of the frame (static and dynamic)
     */
    public endFrame(): DeadWrite[] {
        var variable: Variable;
        var retValue: DeadWrite[] = new Array<DeadWrite>();
        if (this.m_frameEnded) {
            console.log("WARNING: frame already ended !");
        }
        for (variable of this.m_variables) {
            variable.frameEnd();
            //console.log("deadwrites for " + variable.name() + ":" + variable.deadwrites().toString());
            retValue = retValue.concat(variable.deadwrites());
        }
        // Terminate all the child frames
        var frame: MemoryFrame;
        for (frame of currentFrame.childs()){
            if (!frame.isFrameEnded()) {
                console.log("Frame " + frame.ID() + " is not ended");
                retValue = retValue.concat(frame.endFrame());
            }
        }
        this.m_frameEnded = true;
        //console.log("Deadwrites for frame " + this.ID() + ": " + retValue.toString());
        return retValue;
    }
}

/**
 * This class represents a variable
 */
class Variable {
    private m_name: string;
    private m_LastRead: VariableEvent;
    private m_LastWritten: VariableEvent;
    private m_lastIsRead: boolean;
    private m_lastIsWritten: boolean;
    private m_initIID: number;
    private m_deadwrites: DeadWrite[];
    /**
     * Creates a variable
     * @param {string} name the variable name
     */
    constructor(name: string) {
        this.m_name = name;
        this.m_lastIsRead = false;
        this.m_lastIsWritten = false;
        this.m_deadwrites = new Array<DeadWrite>();
    }
    /**
     * hook when this variable is read
     * @param {number} iid the IID of the read
     */
    public read(iid: number): void {
        if (this.m_lastIsRead) {
            // read over read, everything is ok
            console.log(iid + ":variable " + this.name() + " read (over read)");
        }
        if (this.m_lastIsWritten) {
            // read over write, everything is ok
            this.m_lastIsWritten = false;
            console.log(iid + ":variable " + this.name() + " read (over write)");
        }
        this.m_LastRead = new VariableEvent(iid);
        this.m_lastIsRead = true; // set last to read
    }
    /**
     * hook when this variable is written
     * @param {number} iid the IID of the write
     */
    public written(iid: number): void {
        if (this.m_lastIsRead) {
            // write over read, everything is ok
            console.log(iid + ":variable " + this.name() + " written (over read)");
            this.m_lastIsRead = false;
        } else if (this.m_lastIsWritten) {
            // write over write, dynamic dead write !
            console.log(iid + ":variable " + this.name() + " written (over write) dynamic deadwrite !");
            this.m_deadwrites.push(new DeadWrite(this.name(), this.m_initIID, this.m_LastWritten.IID(), iid));
        } else {
            // first write after the declaration
            console.log(iid + ": variable " + this.name() + " written for the first time");
        }
        this.m_LastWritten = new VariableEvent(iid);
        this.m_lastIsWritten = true;
    }
    public init(iid: number): void {
        this.m_initIID = iid;
    }
    /**
     * @returns {Object} the qualified deadwrites
     */
    public deadwrites(): DeadWrite[] {
        return this.m_deadwrites;
    }
    /**
     * @returns {string} the variable name
     */
    public name(): string {
        return this.m_name;
    }
    /**
     * Needs to be called at the frame end to detect the static deadwrites
     */
    public frameEnd(): void {
        //console.log("End for variable " + this.name() + " lastIsRead: " + this.m_lastIsRead + " lastIsWritten: " + this.m_lastIsWritten);
        if (this.m_lastIsWritten) {
            // the last call is a write, this is a deadwrite
            console.log("static deadwrite for variable " + this.name());
            this.m_deadwrites.push(new DeadWrite(this.name(), this.m_initIID, this.m_LastWritten.IID(), undefined));
        }
        if (!this.m_lastIsRead && !this.m_lastIsWritten) {
            // the variable was defined, but never used
            console.log("variable " + this.name() + " was declared but never used");
            this.m_deadwrites.push(new DeadWrite(this.name(), this.m_initIID, undefined, undefined));
        }
    }
}

/**
 * This class represents an event in the variable
 * A read or a write of example
 */
class VariableEvent {
    /**
     * the code ID
     */
    private m_IID: number;
    /**
     * VariableEvent constructor
     * @param {number} iid the code ID
     */
    constructor(iid: number) {
        this.m_IID = iid;
    }
    /**
     * @returns {number} the code ID
     */
    public IID(): number {
        return this.m_IID;
    }
}

/**
 * This class represents a deadwrite
 */
class DeadWrite {
    /**
     * The first call
     */
    private iid1: number;
    /**
     * The second call
     */
    private iid2: number;
    /**
     * The initialisation IID
     */
    private initIID: number;
    /**
     * The variable name
     */
    private name: string;
    /**
     * Deadwrite constructor
     * @param {string} name the variable name
     * @param {number} initIID the variable initialisation IID
     * @param {number} dw1 the first call
     * @param {number} dw2 the second call
     */
    constructor(name: string, initIID: number, dw1: number, dw2: number) {
        this.name = name;
        this.initIID = initIID;
        if (dw1 === undefined && dw2 === undefined) {
            this.iid1 = -1;
            this.iid2 = -1; // both set to -1 for unused variable
        } else if (dw2 === undefined) {
            this.iid2 = -1; // -1 equals to end of execution, static deadwrite
            this.iid1 = dw1;
        } else {
            this.iid2 = dw2;
            this.iid1 = dw1;
        }
    }
    /**
     * @returns {number} the deadwrite source (first call)
     */
    public DeadwriteSource(): number {
        return this.iid1;
    }
    /**
     * @returns {number} the deadwrite position (last call)
     */
    public DeadwriteDetected(): number {
        return this.iid2;
    }
    public toString(): string {
        if (this.iid1 === -1 && this.iid2 === -1) {
            return "[Variable: \"" + this.name + "\" init: " + this.initIID + " ] unused variable";
        } else if (this.iid2 !== -1) {
            return "[Variable: \"" + this.name + "\" init: " + this.initIID + " ] Dynamic deadwrite found at position " + this.iid2 + " (source: " + this.iid1 + " )";
        } else {
            return "[Variable: \"" + this.name + "\" init: " + this.initIID + " ] Static deadwrite found at position " + this.iid1;
        }
    }
}
let frameID: number = 0;
const mainFrame: MemoryFrame = new MemoryFrame(undefined, frameID++);
let currentFrame: MemoryFrame = mainFrame;

/**
 * Hook for the read event
 * @param {number} iid the code IID
 * @param {string} name the variable name
 * @param {boolean} isScriptLocal true if the variable is in the global scope
 */
function readHook(iid: number, name: string, isScriptLocal: boolean) {
    if (isScriptLocal) {
        mainFrame.variableEvent(name, iid, true);
    } else {
        currentFrame.variableEvent(name, iid, true);
    }
}
/**
 * Hook for the write event
 * @param {number} iid the code IID
 * @param {string} name the variable name
 * @param {boolean} isScriptLocal true if the variable is in the global scope
 */
function writeHook(iid: number, name: string, isScriptLocal: boolean) {
    if (isScriptLocal) {
        mainFrame.variableEvent(name, iid, false);
    } else {
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
    //var deadwrites: DeadWrite[] = currentFrame.endFrame();
    //console.log("Deadwrites for frame " + currentFrame.ID() + ": " + deadwrites.length);
    //console.log(deadwrites.toString());
    // reset the frame to the parent before resuming
    //currentFrame = currentFrame.getParent();
    console.log("FunctionExitHook not implemented");
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
    } else {
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
          currentFrame = currentFrame.addChildFrame(functionSid); // add a new child frame
          console.log("new method call !");
          // functionSid will be the IID given at FunctionEnterHook to find the frame
      }
      if (isConstructor) {
          console.log("new object created ! " + iid + " " + f + " " + base + " " + functionIid + " " + functionSid);
      }
  }