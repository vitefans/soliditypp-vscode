import { DebugProtocol } from 'vscode-debugprotocol';
import { SolidityppDebugSession } from './debugSession';


export default class ViewRequestProcessor {
    debugSession: SolidityppDebugSession
    public constructor (debugSession: SolidityppDebugSession) {
        this.debugSession = debugSession;
        return this
    }

    public async serve (command: string, response: DebugProtocol.Response, args: any): Promise<DebugProtocol.Response> {
        switch(command) {
            case "compileResult": {
                response.body = this.getCompileResult()
            }
        }
        
        return response
    }

    public getCompileResult ():any {
        return {
            bytecodes: this.debugSession.bytecodes,
            abiList: this.debugSession.abiList
        }

    }

}