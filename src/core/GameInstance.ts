import * as THREE from 'three/build/three.module'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { CycleInterface, LoopInterface } from './interfaces/GameInterfaces';

const initWidth = window.innerWidth;
const initHeight = window.innerHeight;
const initPixcelRatio = window.devicePixelRatio;

const container = document.body; // 装载canvas的容器
const renderer = new THREE.WebGL1Renderer({ antialias: true });
renderer.encoding = THREE.sRGBEncoding;

const renderTarget = new THREE.WebGLRenderTarget(
    window.innerWidth * window.devicePixelRatio,
    window.innerHeight * window.devicePixelRatio,
    {
        encoding: THREE.sRGBEncoding
    }
); // 离屏渲染纹素

const effectComposor = new EffectComposer(renderer, renderTarget); // 效果合成器
const camera1 = new THREE.PerspectiveCamera(65, initWidth / initHeight, 0.1, 1000); // 玩家观察场景的相机
const camera2 = new THREE.PerspectiveCamera(75, initWidth / initHeight, 0.001, 5); // 玩家观察手部模型的相机
const camera3 = new THREE.OrthographicCamera(-50, 50, 50, -50, 0.001, 1001); // 正交相机: 准星 UI 等
camera3.position.set(0, 0, 1000);
camera3.lookAt(new THREE.Vector3(0, 0, 0));

/** 游戏实例 函数/类 库 */
export namespace GameInstance {

    export enum Cameras {
        playerCamera,
        handModelCamera,
        uiCamera
    }

    /** 游戏视图相关 */
    export abstract class GameView {

        static container: HTMLElement = container;
        static renderer: THREE.WebGLRenderer = renderer;
        static renderTarget: THREE.RenderTarget = renderTarget;

        static effectComposor: EffectComposer = effectComposor;

        static cameras: Map<Cameras, THREE.Camera> = new Map<Cameras, THREE.Camera>();

        /** 获取当前屏幕素质(全屏) */
        static getConatinerStatus = function () {

            // 全屏

            return {
                width: window.innerWidth,
                height: window.innerHeight,
                pixcelRatio: window.devicePixelRatio
            }

        }

        static onWindowResize = () => {

            // 全屏状态下 width = innerWidth; height = window.innderHeight;

            const { width, height, pixcelRatio } = GameView.getConatinerStatus();

            // 改变 投影矩阵
            GameView.cameras.forEach(function (value, key) {
                value.aspect = width / height;
                value.updateProjectionMatrix();
            })

            // 改变GL渲染器相关参数

            GameView.renderer.setPixelRatio(pixcelRatio);
            GameView.renderer.setSize(width, height);

            // 改变 离屏渲染纹素相关参数

            GameView.effectComposor.renderTarget1.setSize(width * pixcelRatio, height * pixcelRatio);
            GameView.effectComposor.renderTarget2.setSize(width * pixcelRatio, height * pixcelRatio);

        }

        static {

            this.cameras.set(Cameras.playerCamera, camera1); // 玩家观察场景的相机(轴序'YXZ'; Y轴Yaw,左y+,右y-; X轴Pitch,上x+,下x-)
            this.cameras.set(Cameras.handModelCamera, camera2); // 玩家观察手部模型的相机
            this.cameras.set(Cameras.uiCamera, camera3); // UI正交相机

            GameView.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            GameView.renderer.outputEncoding = THREE.sRGBEncoding;

            GameView.renderer.setSize(initWidth, initHeight);
            GameView.renderer.setPixelRatio(initPixcelRatio);
            GameView.renderer.setClearColor(new THREE.Color(0xffffff));

            GameView.renderer.domElement.className = 'webgl';

            window.addEventListener('resize', GameView.onWindowResize); // 窗口变动注册事件

            GameView.onWindowResize(); // 启动时执行一次计算方法

        }

    }

    /** 游戏对象容器 */
    export class GameContainer {

        static resourceNumber: number = 0;
        static resourceLoadedNumber: number = 0;

        static objects: Map<string, object> = new Map();
        static resources: Map<string, object> = new Map();

        static cycleObjects = [];
        static loopObjects = [];

        private constructor() { } // 无法被构造

    }

    /** 游戏画面,逻辑循环相关 */
    export class GameLoop {

        static clock: THREE.Clock = new THREE.Clock();
        static loopID: number;
        static pause: boolean = false;

        static init() {

            for (let i = 0; i < GameInstance.GameContainer.cycleObjects.length; i++) {
                <CycleInterface>GameInstance.GameContainer.cycleObjects[i].init()
            }

        }

        static loop() {

            const deltaTime = GameLoop.clock.getDelta();
            const elapsedTime = GameLoop.clock.getElapsedTime();

            GameLoop.loopID = window.requestAnimationFrame(() => { GameLoop.loop() });

            for (let i = 0; i < GameInstance.GameContainer.loopObjects.length; i++) {
                <LoopInterface>GameInstance.GameContainer.loopObjects[i].callEveryFrame(deltaTime, elapsedTime);
            }

            GameLoop.pause = false;

        }

        static pauseLoop() {

            if (!GameLoop.pause) {

                window.cancelAnimationFrame(GameLoop.loopID);
                GameLoop.pause = true;

            }

            else GameLoop.loop();

        }

    }

}

window.addEventListener('keyup', function (e: KeyboardEvent) {

    if (e.code === 'KeyP') GameInstance.GameLoop.pauseLoop();

})