import { GameInstance } from "@src/core/GameInstance";
import { GameWorld, Scenes } from "@src/core/GameWorld";
import { CycleInterface, LoopInterface } from "@src/core/interfaces/GameInterfaces";
import * as THREE from 'three/build/three.module';

import bulletTracerVert from '@assets/shaders/bullet/tracer/bulletTracer.vert?raw';
import bulletTracerFrag from '@assets/shaders/bullet/tracer/bulletTracer.frag?raw';

import { lep, _bpointsEvent, _weaponFireEvent, _weaponTracerEvent } from "@src/viewlayers/LayerEventPipe";

import pointTexture from '@assets/textures/bullet.hole.point.png';
import { WeaponComponentsPositionUtil } from "@src/viewlayers/utils/WeaponComponentsPositionUtil";

const image = new Image();
const texture = new THREE.Texture(image);
image.src = pointTexture;
image.onload = () => { texture.needsUpdate = true; }


const vec3Util: THREE.Vector3 = new THREE.Vector3();
const array3Util: Array<number> = new Array<number>(3);
const array1Util: Array<number> = new Array<number>(1);

/**
 * 曳光弹渲染
 * 
 * 定义曳光弹运动速度, 多久之后小时
 * 1. 开枪枪口位置
 * 2. 最终命中点
 * 3. 开枪时间
 * 
 * 在shader中通过 1, 2, 3 插值获取点的位置, 渲染
 */
export class BulletTracerLayer implements CycleInterface, LoopInterface {

    name: string = 'bullethole layer';

    scene: THREE.Scene;
    camera: THREE.Camera;

    maximun: number = 40; // 最大产生弹点数量

    weaponComponentsPositionUtil: WeaponComponentsPositionUtil;

    bulletTracerFaded: number = .12; // 曳光弹消失速度
    bulletTracerColor: THREE.Vector3 = new THREE.Vector3(0xffffff);

    bulletHoleGeometry: THREE.BufferGeometry = new THREE.BufferGeometry();
    bulletHoleMaterial: THREE.ShaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uBulletTracerFaded: { value: this.bulletTracerFaded },
            uBulletTracerColor: { value: this.bulletTracerColor },
        },
        // blending: THREE.CustomBlending,
        // transparent: true,
        depthTest: false, // 不进行深度检测
        vertexShader: bulletTracerVert,
        fragmentShader: bulletTracerFrag,
    });

    // geometry.attributes 指针用于记录集合体可以复用的buffer

    appearPositionFoat32Array: Float32Array; // 子弹出现位置(枪口)
    disappearPositionFoat32Array: Float32Array; // 子弹消失位置
    generTimeFLoat32Array: Float32Array; // 生成该弹点的时间
    randFoat32Array: Float32Array; // 该弹点的随机大小

    appearPositionBufferAttribute: THREE.BufferAttribute;
    disappearPositionBufferAttribute: THREE.BufferAttribute;
    generTimeBufferAttribute: THREE.BufferAttribute;
    randBufferAttribute: THREE.BufferAttribute;

    // 下一发弹点的位置指针

    index: number = 0;

    init(): void {

        // 绑定指针/初始化

        this.scene = GameWorld.scenes.get(Scenes.Sprites);
        this.camera = GameInstance.GameView.cameras.get(GameInstance.Cameras.playerCamera);
        this.weaponComponentsPositionUtil = WeaponComponentsPositionUtil.getInstance();

        // 生成 array buffer

        this.appearPositionFoat32Array = new Float32Array(new ArrayBuffer(4 * 3 * this.maximun));
        this.disappearPositionFoat32Array = new Float32Array(new ArrayBuffer(4 * 3 * this.maximun));
        this.generTimeFLoat32Array = new Float32Array(new ArrayBuffer(4 * this.maximun));
        this.randFoat32Array = new Float32Array(new ArrayBuffer(4 * this.maximun));

        for (let i = 0; i < this.maximun; i++) { // 默认初始化时所有弹点都不显示, 给他们赋予生成时间为-10s
            array1Util[0] = -10;
            this.generTimeFLoat32Array.set(array1Util, i);
        }

        // 生成 BufferAttribute

        this.appearPositionBufferAttribute = new THREE.BufferAttribute(this.appearPositionFoat32Array, 3);
        this.disappearPositionBufferAttribute = new THREE.BufferAttribute(this.disappearPositionFoat32Array, 3);
        this.generTimeBufferAttribute = new THREE.BufferAttribute(this.generTimeFLoat32Array, 1);
        this.randBufferAttribute = new THREE.BufferAttribute(this.randFoat32Array, 1);

        // 指定 BufferAttribute

        this.bulletHoleGeometry.setAttribute('position', this.appearPositionBufferAttribute);
        this.bulletHoleGeometry.setAttribute('diappearPosition', this.disappearPositionBufferAttribute);
        this.bulletHoleGeometry.setAttribute('generTime', this.generTimeBufferAttribute);
        this.bulletHoleGeometry.setAttribute('rand', this.randBufferAttribute);

        // 添加弹点精灵

        const bulletTracer = new THREE.Points(this.bulletHoleGeometry, this.bulletHoleMaterial);
        bulletTracer.frustumCulled = false; // 不管如何都会渲染
        this.scene.add(bulletTracer);

        lep.addEventListener(_weaponTracerEvent.type, () => {

            this.render();

        })

    }

    /** 添加曳光弹的通用方法 */
    render() {

        // 获取枪口位置

        vec3Util.copy(this.weaponComponentsPositionUtil.calculateMuzzlePosition());
        vec3Util.addScaledVector(this.weaponComponentsPositionUtil.frontDirection, 0.01);
        this.appearPositionFoat32Array.set(vec3Util.toArray(array3Util, 0), this.index * 3);
        this.appearPositionBufferAttribute.needsUpdate = true;

        // 消失位置

        vec3Util.copy(_weaponTracerEvent.detail.endPoint);
        this.disappearPositionFoat32Array.set(vec3Util.toArray(array3Util, 0), this.index * 3);
        this.disappearPositionBufferAttribute.needsUpdate = true;

        // 弹壳生成时间

        array1Util[0] = GameInstance.GameLoop.clock.getElapsedTime();
        this.generTimeFLoat32Array.set(array1Util, this.index);
        this.generTimeBufferAttribute.needsUpdate = true;

        // 弹壳随机种子

        const random = .3 + .7 * Math.random();
        array1Util[0] = random;
        this.randFoat32Array.set(array1Util, this.index);
        this.randBufferAttribute.needsUpdate = true;

        // 更新index

        if (this.index + 1 >= this.maximun) this.index = 0; // 如果index+1超过了设置最大显示弹点的上限,那么就从0开始重新循环
        else this.index += 1;

    }

    callEveryFrame(deltaTime?: number, elapsedTime?: number): void {

        this.bulletHoleMaterial.uniforms.uTime.value = elapsedTime;

    }

}