class MemoryFrame {
    private m_childs: MemoryFrame[];
    private m_variables: Variable[];
    private m_parent: MemoryFrame;
    constructor(parent: MemoryFrame) {
        if (parent === null) {
            // first frame
        } else {
            this.m_parent = parent;
        }
        this.m_childs = new Array<MemoryFrame>();
        this.m_variables = new Array<Variable>();
    }
    public childs(): MemoryFrame[] {
        return this.m_childs;
    }
    public deadwrites(): Variable[] {
        return null; // not implemented
    }
    public variableEvent(name: string, iid: number, readOrWrite: boolean): void {
        var tmp: any, variable: Variable;
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
        } else {
            // write
            variable.written(iid);
        }
    }
    public getParent(): MemoryFrame {
        return this.m_parent;
    }
}

class Variable {
    private m_name: string;
    private m_LastRead: VariableEvent;
    private m_LastWritten: VariableEvent;
    private m_lastIsRead: boolean;
    private m_lastIsWritten: boolean;
    private m_deadwrites: DeadWrite[];
    constructor(name: string) {
        this.m_name = name;
        this.m_lastIsRead = false;
        this.m_lastIsWritten = false;
    }
    public read(iid: number) {
        if (this.m_lastIsRead) {
            // read over read, everything is ok
        }
        if (this.m_lastIsWritten) {
            // read over write, everything is ok
            this.m_lastIsWritten = false;
        }
        this.m_LastRead = new VariableEvent(iid);
        this.m_lastIsRead = true; // set last to read
    }
    public written(iid: number) {
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
    }
    public deadwrites(): DeadWrite[] {
        return this.m_deadwrites;
    }
    public name(): string {
        return this.m_name;
    }
}

class VariableEvent {
    private m_IID: number;
    constructor(iid: number) {
        this.m_IID = iid;
    }
    public IID(): number {
        return this.m_IID;
    }
}

class DeadWrite {
    private iid1: number;
    private iid2: number;
    constructor(dw1: number, dw2: number) {
        this.iid1 = dw1;
        if (dw2 === undefined) {
            this.iid2 = -1; // -1 equals to end of execution
        } else {
            this.iid2 = dw2;
        }
    }
    public DeadwriteSource(): number {
        return this.iid1;
    }
    public DeadwriteDetected(): number {
        return this.iid2;
    }
}