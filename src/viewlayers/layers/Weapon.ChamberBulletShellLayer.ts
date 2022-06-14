import * as THREE from 'three/build/three.module';

import bulletShellVert from '@assets/shaders/bullet/shell/bulletshell.vert?raw';
import bulletShellFrag from '@assets/shaders/bullet/shell/bulletshell.frag?raw';

import bulletshellTexture from '@assets/textures/bullet.shell.png';
import { CycleInterface, LoopInterface } from '@src/core/interfaces/GameInterfaces';
import { GameWorld, Scenes } from '@src/core/GameWorld';
import { lep, _equipWeaponEvent, _weaponFireEvent } from '@src/viewlayers/LayerEventPipe';
import { GameInstance } from '@src/core/GameInstance';
import { LocalPlayer } from '@src/game/player/LocalPlayer';

// 材质

const image = new Image();
const texture = new THREE.Texture(image);
image.src = bulletshellTexture;
image.onload = () => { texture.needsUpdate = true; }

// 工具变量

const array3Util: Array<number> = new Array<number>(3);
const array1Util: Array<number> = new Array<number>(1);
const chamberPositionUtil = new THREE.Vector3(); // 弹膛位置

/**
 * 开枪子弹壳从弹舱中弹出,掉落到地面并且反弹起来
 * 需要的参数: 玩家位置, 当前弹舱的相对位置, 
 */
export class ChamberBulletShell implements CycleInterface, LoopInterface {

    name: string = 'bullet shell layer';

    scene: THREE.Scene;
    camera: THREE.Camera;

    ifRender: boolean = false; // 是否渲染该层

    maximun: number = 10; // 最大产生弹壳贴图的数量

    bulletShellOpacity: number = 1.; // 弹孔透明度
    bulletShellScale: number = 1.2; // 弹孔大小
    bulletShellDisappearTime: number = .4; // 弹孔存在时间(多少秒后开始渐变消失) Math.sqrt(1.8/9.8) 约等于0.4 

    bulletShellsGeometry = new THREE.BufferGeometry();
    bulletShellsMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: -20 },
            uDisapperTime: { value: this.bulletShellDisappearTime },
            uScale: { value: this.bulletShellScale },
            uOpacity: { value: this.bulletShellOpacity },
            uBulletShellT: { value: texture },
        },
        blending: THREE.CustomBlending,
        vertexShader: bulletShellVert,
        fragmentShader: bulletShellFrag,
        // depthTest: THREE.NeverDepth, // 只会渲染到本地画面,不启用深度检测
    });

    positionFoat32Array: Float32Array; // 击中三角面的点位置
    generTimeFLoat32Array: Float32Array; // 生成该弹壳的时间
    randFoat32Array: Float32Array; // 随机种子

    positionBufferAttribute: THREE.BufferAttribute;
    generTimeBufferAttribute: THREE.BufferAttribute;
    randBufferAttribute: THREE.BufferAttribute;

    bulletShellIndex: number = 0;

    init(): void {

        // 绑定指针

        this.scene = GameWorld.scenes.get(Scenes.Handmodel);
        this.camera = GameInstance.GameView.cameras.get(GameInstance.Cameras.handModelCamera);

        // 添加弹点精灵

        const bulletShells = new THREE.Points(this.bulletShellsGeometry, this.bulletShellsMaterial);
        bulletShells.frustumCulled = false; // 不管如何都会渲染
        this.scene.add(bulletShells);

        // 初始化buffers

        this.initBuffers();

        // 监听当前装备武器的弹舱位置

        this.listenChamberPosition();

        // 监听开火事件

        this.listenOpenFire();

    }

    /**
     * 初始化buffers
     */
    initBuffers() {

        // 生成 array buffer

        this.positionFoat32Array = new Float32Array(new ArrayBuffer(4 * 3 * this.maximun));
        this.generTimeFLoat32Array = new Float32Array(new ArrayBuffer(4 * this.maximun));
        this.randFoat32Array = new Float32Array(new ArrayBuffer(4 * this.maximun));

        for (let i = 0; i < this.maximun; i++) { // 默认初始化时所有弹点都不显示, 给他们赋予生成时间为-10s
            array1Util[0] = -10;
            this.generTimeFLoat32Array.set(array1Util, i);
        }

        // 生成 BufferAttribute

        this.positionBufferAttribute = new THREE.BufferAttribute(this.positionFoat32Array, 3);
        this.generTimeBufferAttribute = new THREE.BufferAttribute(this.generTimeFLoat32Array, 1);
        this.randBufferAttribute = new THREE.BufferAttribute(this.randFoat32Array, 1);

        // 指定 BufferAttribute

        this.bulletShellsGeometry.setAttribute('position', this.positionBufferAttribute);
        this.bulletShellsGeometry.setAttribute('generTime', this.generTimeBufferAttribute);
        this.bulletShellsGeometry.setAttribute('rand', this.randBufferAttribute);

    }


    /**
     * 更新当前装备武器的弹舱位置: 只有定义了弹舱位置的武器才会渲染该层效果
     */
    listenChamberPosition() {

        lep.addEventListener(_equipWeaponEvent.type, (e: CustomEvent) => {

            if (_equipWeaponEvent.detail.weaponInstance && _equipWeaponEvent.detail.weaponInstance.chamberPosition) {

                this.ifRender = true;
                chamberPositionUtil.copy(_equipWeaponEvent.detail.weaponInstance.chamberPosition);

            } else this.ifRender = false;

        })

    }

    /**
     * 监听渲染事件(武器确切开火)
     */
    listenOpenFire() {

        lep.addEventListener(_weaponFireEvent.type, (e: CustomEvent) => {

            if (this.ifRender) this.render();

        });

    }

    /** 
     * 添加弹壳
     */
    render() {

        // 弹舱位置

        this.positionFoat32Array.set(chamberPositionUtil.toArray(array3Util, 0), this.bulletShellIndex * 3);
        this.positionBufferAttribute.needsUpdate = true;

        // 弹壳生成时间

        array1Util[0] = GameInstance.GameLoop.clock.getElapsedTime();
        this.generTimeFLoat32Array.set(array1Util, this.bulletShellIndex);
        this.generTimeBufferAttribute.needsUpdate = true;

        // 弹壳随机种子

        const random = Math.random();
        array1Util[0] = random;
        this.randFoat32Array.set(array1Util, this.bulletShellIndex);
        this.randBufferAttribute.needsUpdate = true;

        // 更新index

        if (this.bulletShellIndex + 1 >= this.maximun) this.bulletShellIndex = 0; // 如果index+1超过了设置最大显示弹点的上限,那么就从0开始重新循环
        else this.bulletShellIndex += 1;

    }

    callEveryFrame(deltaTime?: number, elapsedTime?: number): void {

        this.bulletShellsMaterial.uniforms.uTime.value = elapsedTime; // 跟新当前时间

    }

}