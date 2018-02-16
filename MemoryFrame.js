var MemoryFrame = /** @class */ (function () {
    function MemoryFrame(parent) {
        if (parent === null) {
            // first frame
        }
        else {
            this.m_parent = parent;
        }
        this.m_childs = new Array();
        this.m_variables = new Array();
    }
    MemoryFrame.prototype.childs = function () {
        return this.m_childs;
    };
    MemoryFrame.prototype.deadwrites = function () {
        return null; // not implemented
    };
    MemoryFrame.prototype.variableEvent = function (name, iid, readOrWrite) {
        var tmp, variable;
        for (tmp in this.m_variables) {
            if (tmp.name() === name) {
                variable = tmp;
            }
        }
        if (variable === undefined) {
            variable = new Variable(name);
            this.m_variables.push(variable);
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
    MemoryFrame.prototype.getParent = function () {
        return this.m_parent;
    };
    return MemoryFrame;
}());
var Variable = /** @class */ (function () {
    function Variable(name) {
        this.m_name = name;
        this.m_lastIsRead = false;
        this.m_lastIsWritten = false;
    }
    Variable.prototype.read = function (iid) {
        if (this.m_lastIsRead) {
            // read over read, everything is ok
        }
        if (this.m_lastIsWritten) {
            // read over write, everything is ok
            this.m_lastIsWritten = false;
        }
        this.m_LastRead = new VariableEvent(iid);
        this.m_lastIsRead = true; // set last to read
    };
    Variable.prototype.written = function (iid) {
        if (this.m_lastIsRead) {
            // write over read, everything is ok
            this.m_lastIsRead = false;
        }
        if (this.m_lastIsWritten) {
            // write over write, dynamic dead write !
            this.m_deadwrites.push(new DeadWrite(this.m_LastWritten.IID(), iid));
        }
        this.m_LastWritten = new VariableEvent(iid);
        this.m_lastIsWritten = true;
    };
    Variable.prototype.deadwrites = function () {
        return this.m_deadwrites;
    };
    Variable.prototype.name = function () {
        return this.m_name;
    };
    return Variable;
}());
var VariableEvent = /** @class */ (function () {
    function VariableEvent(iid) {
        this.m_IID = iid;
    }
    VariableEvent.prototype.IID = function () {
        return this.m_IID;
    };
    return VariableEvent;
}());
var DeadWrite = /** @class */ (function () {
    function DeadWrite(dw1, dw2) {
        this.iid1 = dw1;
        if (dw2 === undefined) {
            this.iid2 = -1; // -1 equals to end of execution
        }
        else {
            this.iid2 = dw2;
        }
    }
    DeadWrite.prototype.DeadwriteSource = function () {
        return this.iid1;
    };
    DeadWrite.prototype.DeadwriteDetected = function () {
        return this.iid2;
    };
    return DeadWrite;
}());
