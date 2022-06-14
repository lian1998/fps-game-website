
import * as THREE from "three/build/three.module";

import { GameInstance } from "@src/core/GameInstance";
import { GameWorld, Scenes } from "@src/core/GameWorld";
import { CycleInterface, LoopInterface } from "@src/core/interfaces/GameInterfaces";

import chamberSmokeVert from '@assets/shaders/chamber/smoke.vert?raw'
import chamberSmokeFrag from '@assets/shaders/chamber/smoke.frag?raw'

import { lep, _equipWeaponEvent, _weaponFireEvent } from "../LayerEventPipe";

import smokeTexture from '@assets/textures/smoke.png';
import { WeaponComponentsPositionUtil } from "@src/viewlayers/utils/WeaponComponentsPositionUtil";

const image = new Image();
const texture = new THREE.Texture(image);
image.src = smokeTexture;
image.onload = () => { texture.needsUpdate = true; }

// 工具变量

const array3Util: Array<number> = new Array<number>(3);
const array1Util: Array<number> = new Array<number>(1);
/**
 * 武器开火烟雾效果
 */
export class ChamberSmokeLayer implements CycleInterface, LoopInterface {

    name: string = 'chamber smoke layer';

    ifRender: boolean = false;

    scene: THREE.Scene;
    camera: THREE.Camera;
    handModelCamera: THREE.Camera;

    maximun: number = 20 * 2; // 最大产生弹壳贴图的数量

    weaponComponentsPositionUtil: WeaponComponentsPositionUtil;

    chamberSmokeOpacityFactor: number = .1; // 透明度
    chamberSmokeDisapperTime: number = 1.; // 消散时间
    chamberSmokeFadeTime: number = 1.5; // 消散渐变时间
    chamberSmokeScale: number = 1.5; // 弹孔大小
    chamberSmokeSpeed: number = .2; // 烟雾运动速度
    chamberSmokeDisappearTime: number = .4; // 弹孔存在时间(多少秒后开始渐变消失) Math.sqrt(1.8/9.8) 约等于0.4 

    chamberSmokeGeometry: THREE.BufferGeometry = new THREE.BufferGeometry();
    chamberSmokeSM: THREE.ShaderMaterial = new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        uniforms: {
            uTime: { value: 0. },
            uSmokeT: { value: texture },
            uOpacityFactor: { value: this.chamberSmokeOpacityFactor },
            uDisappearTime: { value: this.chamberSmokeDisapperTime },
            uSpeed: { value: this.chamberSmokeSpeed },
            uFadeTime: { value: this.chamberSmokeFadeTime },
            uScale: { value: this.chamberSmokeScale },
            uDisapperTime: { value: this.chamberSmokeDisappearTime },
        },
        depthTest: THREE.NeverDepth,
        depthWrite: false, // 目的是在进行深度检测时自己不会影响自己
        vertexShader: chamberSmokeVert,
        fragmentShader: chamberSmokeFrag,
    });

    positionFoat32Array: Float32Array; // 击中三角面的点位置
    directionFloat32Array: Float32Array; // 烟雾运动方向
    generTimeFLoat32Array: Float32Array; // 生成该弹壳的时间
    randFoat32Array: Float32Array; // 随机种子

    positionBufferAttribute: THREE.BufferAttribute;
    directionBufferAttribute: THREE.BufferAttribute;
    generTimeBufferAttribute: THREE.BufferAttribute;
    randBufferAttribute: THREE.BufferAttribute;

    chamberSmokeIndex: number = 0;

    init(): void {

        this.scene = GameWorld.scenes.get(Scenes.Sprites);
        this.camera = GameInstance.GameView.cameras.get(GameInstance.Cameras.playerCamera);
        this.handModelCamera = GameInstance.GameView.cameras.get(GameInstance.Cameras.handModelCamera);

        // 添加弹点精灵

        const chamberSmokes = new THREE.Points(this.chamberSmokeGeometry, this.chamberSmokeSM);
        chamberSmokes.frustumCulled = false; // 不管如何都会渲染
        this.scene.add(chamberSmokes);

        // 初始化buffers

        this.initBuffers();

        // 当前装备武器的弹舱位置

        this.listenChamberPosition();

        // 监听开火事件

        this.listenOpenFire();


    }

    initBuffers() {

        this.positionFoat32Array = new Float32Array(new ArrayBuffer(4 * 3 * this.maximun));
        this.directionFloat32Array = new Float32Array(new ArrayBuffer(4 * 3 * this.maximun));
        this.generTimeFLoat32Array = new Float32Array(new ArrayBuffer(4 * this.maximun));
        this.randFoat32Array = new Float32Array(new ArrayBuffer(4 * this.maximun));

        for (let i = 0; i < this.maximun; i++) { // 默认初始化时所有弹点都不显示, 给他们赋予生成时间为-10s
            array1Util[0] = -10;
            this.generTimeFLoat32Array.set(array1Util, i);
        }

        // 生成 BufferAttribute

        this.positionBufferAttribute = new THREE.BufferAttribute(this.positionFoat32Array, 3);
        this.directionBufferAttribute = new THREE.BufferAttribute(this.directionFloat32Array, 3);
        this.generTimeBufferAttribute = new THREE.BufferAttribute(this.generTimeFLoat32Array, 1);
        this.randBufferAttribute = new THREE.BufferAttribute(this.randFoat32Array, 1);

        // 指定 BufferAttribute

        this.chamberSmokeGeometry.setAttribute('position', this.positionBufferAttribute);
        this.chamberSmokeGeometry.setAttribute('direction', this.directionBufferAttribute);
        this.chamberSmokeGeometry.setAttribute('generTime', this.generTimeBufferAttribute);
        this.chamberSmokeGeometry.setAttribute('rand', this.randBufferAttribute);

    }

    listenOpenFire() {

        lep.addEventListener(_weaponFireEvent.type, (e: CustomEvent) => {

            if (this.ifRender) this.render();

        });
    }

    /**
   * 更新当前装备武器的弹舱位置: 只有定义了弹舱位置的武器才会渲染该层效果
   */
    listenChamberPosition() {

        this.weaponComponentsPositionUtil = WeaponComponentsPositionUtil.getInstance();

        lep.addEventListener(_equipWeaponEvent.type, (e: CustomEvent) => {

            if (_equipWeaponEvent.detail.weaponInstance && _equipWeaponEvent.detail.weaponInstance.chamberPosition) this.ifRender = true;
            else this.ifRender = false;

        })

    }

    render() {

        // positions

        this.positionFoat32Array.set(
            this.weaponComponentsPositionUtil.calculateChamberPosition().toArray(array3Util, 0),
            this.chamberSmokeIndex * 3
        );
        this.positionBufferAttribute.needsUpdate = true;

        // directions

        const rightDirection = this.weaponComponentsPositionUtil.rightDirection; // 烟雾大致向右运动
        this.directionFloat32Array.set(
            rightDirection.toArray(array3Util, 0),
            this.chamberSmokeIndex * 3
        );
        this.directionBufferAttribute.needsUpdate = true;

        // genderTimes

        array1Util[0] = GameInstance.GameLoop.clock.getElapsedTime();
        this.generTimeFLoat32Array.set(array1Util, this.chamberSmokeIndex * 1);
        this.generTimeBufferAttribute.needsUpdate = true;

        // rands

        array1Util[0] = Math.random();
        this.randFoat32Array.set(array1Util, this.chamberSmokeIndex * 1);
        this.randBufferAttribute.needsUpdate = true;

        if (this.chamberSmokeIndex + 1 >= this.maximun) this.chamberSmokeIndex = 0; // 如果index+1超过了设置最大显示弹点的上限,那么就从0开始重新循环
        else this.chamberSmokeIndex += 1;

    }

    callEveryFrame(deltaTime?: number, elapsedTime?: number): void {

        this.chamberSmokeSM.uniforms.uTime.value = elapsedTime;

    }

}