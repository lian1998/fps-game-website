import { Sky } from 'three/examples/jsm/objects/Sky'
import * as THREE from 'three/build/three.module'
import { GameInstance } from "@src/core/GameInstance"
import { CycleInterface } from '@src/core/interfaces/GameInterfaces';
import { GameWorld, Scenes } from '@src/core/GameWorld';

// 天空盒
const skyEffectConfig = {
    turbidity: 4,
    rayleigh: 1,
    mieCoefficient: 0.003,
    mieDirectionalG: 0.7,
    elevation: 20,
    azimuth: -10,
    exposure: GameInstance.GameView.renderer.toneMappingExposure,
}

/**
 * 利用ThreeJs SkyShader生成材质, 赋予盒子网格作为天空盒
 */
export class SkyLayer implements CycleInterface {

    name: string = 'sky layer';

    scene: THREE.Scene;
    sky: Sky = new Sky();
    sun: THREE.Vector3 = new THREE.Vector3();

    /** 当前情况不需要每帧都更新信息 */
    init(): void {

        this.scene = GameWorld.scenes.get(Scenes.Skybox);

        // THREE.Sky 本质上是通过shader构造材质, 添加给一个盒体; 这里设置盒体的大小
        this.sky.scale.setScalar(1000);

        const uniforms = this.sky.material.uniforms;
        uniforms['turbidity'].value = skyEffectConfig.turbidity;
        uniforms['rayleigh'].value = skyEffectConfig.rayleigh;
        uniforms['mieCoefficient'].value = skyEffectConfig.mieCoefficient;
        uniforms['mieDirectionalG'].value = skyEffectConfig.mieDirectionalG;

        const phi = THREE.MathUtils.degToRad(90 - skyEffectConfig.elevation);
        const theta = THREE.MathUtils.degToRad(skyEffectConfig.azimuth);

        this.sun.setFromSphericalCoords(1, phi, theta);

        uniforms['sunPosition'].value.copy(this.sun);

        GameInstance.GameView.renderer.toneMappingExposure = skyEffectConfig.exposure;

        this.scene.add(this.sky);

    }

}