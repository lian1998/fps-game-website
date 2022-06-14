import { CycleInterface, LoopInterface } from "@src/core/interfaces/GameInterfaces";

import * as THREE from "three/build/three.module";

import muzzlesflashVert from '@assets/shaders/muzzle/flash.vert?raw'
import muzzlesflashFrag from '@assets/shaders/muzzle/flash.frag?raw'

import { GameInstance } from "@src/core/GameInstance";
import { GameWorld, Scenes } from "@src/core/GameWorld";
import { lep, _equipWeaponEvent, _weaponFireEvent } from "@src/viewlayers/LayerEventPipe";

import flashTexture from '@assets/textures/muzzle.flash.png';

const image = new Image();
const texture = new THREE.Texture(image);
image.src = flashTexture;
image.onload = () => { texture.needsUpdate = true; }

const muzzlePositionUtil = new THREE.Vector3(); // 枪口位置
const array3Util: Array<number> = new Array<number>(3);
const array1Util: Array<number> = new Array<number>(1);

/**
 * 枪口火光
 */
export class MuzzleFlashLayer implements CycleInterface, LoopInterface {

    name: string = 'muzzle flash layer';

    ifRender: boolean = false;

    scene: THREE.Scene;
    camera: THREE.Camera;

    muzzleFlashSize: number = 1.5;
    muzzleFlashTime: number = .01;

    muzzleFlashGeometry: THREE.BufferGeometry = new THREE.BufferGeometry();
    muzzleFlashSM: THREE.ShaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uScale: { value: this.muzzleFlashSize },
            uTime: { value: -1. },
            uFireTime: { value: -1. },
            uOpenFireT: { value: texture },
            uFlashTime: { value: this.muzzleFlashTime },
        },
        vertexShader: muzzlesflashVert,
        fragmentShader: muzzlesflashFrag,
        blending: THREE.AdditiveBlending,
    });

    positionFoat32Array: Float32Array;
    positionBufferAttribute: THREE.BufferAttribute;
    randFloat32Array: Float32Array;
    randBufferAttribute: THREE.BufferAttribute;

    init(): void {

        // 类指针

        this.scene = GameWorld.scenes.get(Scenes.Handmodel);
        this.camera = GameInstance.GameView.cameras.get(GameInstance.Cameras.playerCamera);

        // 添加物体至场景

        const muzzleFlash = new THREE.Points(this.muzzleFlashGeometry, this.muzzleFlashSM);
        muzzleFlash.frustumCulled = false;
        this.scene.add(muzzleFlash);

        // 初始化buffers

        this.initBuffers();

        // 监听当前武器的枪口位置

        this.listenMuzzlePosition();

        // 监听渲染事件

        this.listenOpenFire();

    }

    initBuffers(): void {

        this.positionFoat32Array = new Float32Array(new ArrayBuffer(4 * 3));
        this.randFloat32Array = new Float32Array(new ArrayBuffer(4 * 1));
        this.positionBufferAttribute = new THREE.BufferAttribute(this.positionFoat32Array, 3);
        this.randBufferAttribute = new THREE.BufferAttribute(this.randFloat32Array, 1);

        // 创建几何

        this.muzzleFlashGeometry.setAttribute('position', this.positionBufferAttribute);
        this.muzzleFlashGeometry.setAttribute('rand', this.randBufferAttribute);
    }

    /**
     * 监听当前武器的枪口位置
     */
    listenMuzzlePosition(): void {

        lep.addEventListener(_equipWeaponEvent.type, (e: CustomEvent) => {

            if (_equipWeaponEvent.detail.weaponInstance && _equipWeaponEvent.detail.weaponInstance.muzzlePosition) {

                muzzlePositionUtil.copy(_equipWeaponEvent.detail.weaponInstance.muzzlePosition);

                this.ifRender = true;

            } else this.ifRender = false;

        })

    }

    listenOpenFire(): void {

        lep.addEventListener(_weaponFireEvent.type, (e: CustomEvent) => {

            if (this.ifRender) this.render();

        });

    }

    render() {

        // 枪口位置

        this.positionFoat32Array.set(muzzlePositionUtil.toArray(array3Util, 0), 0);
        this.positionBufferAttribute.needsUpdate = true;

        // 开火时间

        this.muzzleFlashSM.uniforms.uFireTime.value = GameInstance.GameLoop.clock.getElapsedTime();

        // 闪光随机种子

        const rand = Math.random();
        array1Util[0] = rand;
        this.randFloat32Array.set(array1Util, 0);
        this.randBufferAttribute.needsUpdate = true;

    }

    callEveryFrame(deltaTime?: number, elapsedTime?: number): void {

        // 每帧向显卡传入当前渲染时间
        this.muzzleFlashSM.uniforms.uTime.value = elapsedTime;

    }

}