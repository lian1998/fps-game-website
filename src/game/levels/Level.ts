import { CycleInterface, LoopInterface } from "@src/core/interfaces/GameInterfaces";

export class Level implements CycleInterface, LoopInterface {

    init(): void {
        throw new Error("Method not implemented.");
    }

    callEveryFrame(deltaTime?: number, elapsedTime?: number): void {
        throw new Error("Method not implemented.");
    }

}