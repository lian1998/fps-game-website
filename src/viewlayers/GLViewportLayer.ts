import { CycleInterface, LoopInterface } from "@src/core/interfaces/GameInterfaces";
import { GameInstance } from "@src/core/GameInstance";
import { GameWorld, Scenes } from "@src/core/GameWorld";

import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

const playerCamera = GameInstance.GameView.cameras.get(GameInstance.Cameras.playerCamera);
const handModelCamera = GameInstance.GameView.cameras.get(GameInstance.Cameras.handModelCamera);
const uiCamera = GameInstance.GameView.cameras.get(GameInstance.Cameras.uiCamera);
const effectComposor = GameInstance.GameView.effectComposor;

/**
 * 所有WebGl输出画面的集合, 使用 ThreeJs effectComposr 合成画面的多个渲染
 */
export class GLViewportLayer implements CycleInterface, LoopInterface {

    name: string = 'glviewport layer';
    fxaaPass: ShaderPass = new ShaderPass(FXAAShader);

    init(): void {

        let renderPass: RenderPass;

        // 通道1 装载背景信息
        const skybox = GameWorld.scenes.get(Scenes.Skybox);
        renderPass = new RenderPass(skybox, playerCamera);
        effectComposor.addPass(renderPass);
        renderPass.clearDepth = true; // 后续的通道覆盖该信息

        // 通道2 渲染场景
        const level = GameWorld.scenes.get(Scenes.Level);
        renderPass = new RenderPass(level, playerCamera);
        effectComposor.addPass(renderPass);
        renderPass.clear = false;
        renderPass.clearDepth = false;

        // 通道3 渲染特效层
        const sprits = GameWorld.scenes.get(Scenes.Sprites);
        renderPass = new RenderPass(sprits, playerCamera);
        effectComposor.addPass(renderPass);
        renderPass.clear = false;
        renderPass.clearDepth = false;

        // 通道3 渲染手部模型, 最后一层渲染
        const handModel = GameWorld.scenes.get(Scenes.Handmodel);
        renderPass = new RenderPass(handModel, handModelCamera);
        effectComposor.addPass(renderPass);
        renderPass.clear = false;
        renderPass.clearDepth = true;

        // 通道4 UI
        const ui = GameWorld.scenes.get(Scenes.UI);
        renderPass = new RenderPass(ui, uiCamera);
        effectComposor.addPass(renderPass);
        renderPass.clear = false;
        renderPass.clearDepth = true;

        // 通道4 后期给画面添上FXAA(快速近似抗锯齿)
        this.fxaaPass = new ShaderPass(FXAAShader);
        GameInstance.GameView.effectComposor.addPass(this.fxaaPass);

        this.updateFXAAUnifroms();

        window.addEventListener('resize', () => { this.updateFXAAUnifroms() }) // 监听重绘事件

    }

    updateFXAAUnifroms() {

        const { width, height, pixcelRatio } = GameInstance.GameView.getConatinerStatus();

        this.fxaaPass.material.uniforms['resolution'].value.x = 1 / (width * pixcelRatio);
        this.fxaaPass.material.uniforms['resolution'].value.y = 1 / (height * pixcelRatio);

    }

    callEveryFrame(deltaTime?: number, elapsedTime?: number): void {
        GameInstance.GameView.effectComposor.render();
    }

}