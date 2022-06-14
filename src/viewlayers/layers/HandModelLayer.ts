import * as THREE from 'three/build/three.module';
import { lep, PointLockEventTYPE } from '@src/viewlayers/LayerEventPipe';
import { CycleInterface, LoopInterface } from "@src/core/interfaces/GameInterfaces";
import { GameInstance } from '@src/core/GameInstance';
import { GameWorld, Scenes } from '@src/core/GameWorld';
import { WindowUtil } from '@src/core/WindowUtil';
import { ResourceUtil } from '@src/resources/ResourceUtil'
import { LocalPlayer } from '@src/game/player/LocalPlayer';

let deltaZUtil = 0;
let deltaYUtil = 0;

let screenMoveX = 0; // 不断记录鼠标移动的距离, 横拉
let screenMoveY = 0; // 不断记录鼠标移动的距离, 纵拉
let mouseFloatX = 0.08; // 鼠标横拉导致的相机z轴坐标变化最大值
let mouseFloatY = 0.12; // 鼠标纵拉导致的相机y轴坐标变化最大值

let breathFloatScale = 0.01; // 呼吸导致的相机y轴变化最大值
let cameraDefaultPosition = new THREE.Vector3();

// breath   -1, 1   - breathFloatScale, breathFloatScale
// screenMoveX   -256, 256   -mouseFloatX, mouseFloatX
// screenMoveY   -256, 256   -mouseFloatY, mouseFloatY

/**
 * 手部模型动画
 */
export class HandModelLayer implements CycleInterface, LoopInterface {

    name: string = 'hand model layer';

    scene: THREE.Scene;
    camera: THREE.Camera;
    localPlayer: LocalPlayer;
    animationMixer: THREE.AnimationMixer;

    init(): void {

        this.scene = GameWorld.scenes.get(Scenes.Handmodel);

        lep.addEventListener('pointlock', function (e: CustomEvent) { // 监听自定义的 pointlock.mousemove 事件
            if (e.detail.type === PointLockEventTYPE.MOUSEMOVE) {
                screenMoveX = THREE.MathUtils.clamp(screenMoveX + e.detail.movementX, -256, 256);
                screenMoveY = THREE.MathUtils.clamp(screenMoveY + e.detail.movementY, -256, 256);
            }
        })

        // 初始化相机位置
        this.initCameraStatus();

        // 加载手模型
        this.addHandMesh();

    }

    callEveryFrame(deltaTime?: number, elapsedTime?: number): void {

        if (WindowUtil.PointLock.isLocked) {

            // 工具变量
            deltaZUtil = 0;
            deltaYUtil = 0;

            // 1. 拉动瞄准位置带来的惯性 (浏览器大概每秒输出70次鼠标变化的事件)
            const cameraDeltaZ = THREE.MathUtils.mapLinear(screenMoveX, -256, 256, -mouseFloatX, mouseFloatX);
            deltaZUtil += cameraDeltaZ;

            const cameraDeltaY = THREE.MathUtils.mapLinear(screenMoveY, -256, 256, -mouseFloatY, mouseFloatY);
            deltaYUtil += cameraDeltaY;

            // 2. 呼吸带来的模型上下浮动, 由于只渲染模型和枪支, 因此移动模型就是相对于移动相机
            const sinDeltaTime = (Math.sin(elapsedTime) + 1) / 2;
            const breathDelta = THREE.MathUtils.lerp(-breathFloatScale, breathFloatScale, sinDeltaTime);
            deltaYUtil += breathDelta;

            // 3. 改变增量值
            this.camera.position.z = cameraDefaultPosition.z + deltaZUtil;
            this.camera.position.y = cameraDefaultPosition.y - deltaYUtil;

            // 实时递减变量 screenMoveX, screenMoveY
            const base = deltaTime;
            if (screenMoveX > 0) screenMoveX = Math.min(0, screenMoveX - base);
            else if (screenMoveX < 0) screenMoveX = Math.max(0, screenMoveX + base);
            if (screenMoveY > 0) screenMoveY = Math.min(0, screenMoveY - base);
            else if (screenMoveY < 0) screenMoveY = Math.max(0, screenMoveY + base);

        }

        this.animationMixer.update(deltaTime);

    }


    /** 初始化手模型的相机位置(和blender一致) */
    initCameraStatus() {

        this.camera = GameInstance.GameView.cameras.get(GameInstance.Cameras.handModelCamera);
        this.camera.clearViewOffset();
        this.camera.near = 0.001;
        this.camera.far = 999;
        this.camera.fov = 70; // 60 ~ 80
        this.camera.scale.z = 1.5; // 1 ~ 1.6
        this.camera.position.set(-1.6, 1.4, 0);
        cameraDefaultPosition.copy(this.camera.position);
        this.camera.rotation.y = - Math.PI / 2;

    }


    /** 添加手模型 */
    addHandMesh() {

        const armature: THREE.Object3D = ResourceUtil.resources.get('Armature');
        const arms: THREE.SkinnedMesh = ResourceUtil.resources.get('Arms');

        (<THREE.SkinnedMesh>arms).material = this.getLoacalPlayer().roleMaterial;
        (<THREE.SkinnedMesh>arms).frustumCulled = false;
        this.animationMixer = ResourceUtil.resources.get('AnimationMixer');

        arms.visible = true;
        this.scene.add(armature);
        this.scene.add(arms);

    }

    /** 获取本地玩家 */
    getLoacalPlayer(): LocalPlayer {

        if (!this.localPlayer) this.localPlayer = <LocalPlayer>GameInstance.GameContainer.objects.get('local player');
        return this.localPlayer;

    }

}