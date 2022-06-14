export interface CycleInterface {

    /** 初始化时调用 */
    init(): void;

}

export interface LoopInterface {

    /** 循环计算帧时调用 */
    callEveryFrame(deltaTime?: number, elapsedTime?: number): void;

}