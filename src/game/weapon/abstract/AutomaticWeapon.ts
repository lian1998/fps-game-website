import * as THREE from 'three/build/three.module'
import { CycleInterface, LoopInterface } from '@src/core/interfaces/GameInterfaces';
import { WeaponSystem, WeaponType } from '@src/game/weapon/WeaponSystem';
import { GameInstance } from '@src/core/GameInstance';
import { ResourceUtil } from '@src/resources/ResourceUtil';
import { wep, WeaponEventTYPE, _weaponAnimEvent, _weaponFireLogicEvent } from '@src/game/weapon/WeaponEventPipe';
import { GameWorld, Scenes } from '@src/core/GameWorld';
import { WeaponInterface } from '@src/game/weapon/abstract/WeaponInterface';
import { WindowUtil } from '@src/core/WindowUtil';
import { iep, InputEventTYPE, _inputEvent } from '@src/game/input/InputEventPipe';

// 工具变量
let startRecover = true; // 下一帧是否是刚进入恢复状态
let startRecoverLine = 0; // 此次进入恢复状态初始的膛线值

let cameraRotateTotalX = 0; // 记录相机受弹道图影响的总值
let cameraRotateTotalY = 0;

let cameraRotationBasicTotal = 0; // 基础上下晃动

let recovercameraRotateTotalX = 0; // 此次恢复需要恢复的总值
let recovercameraRotateTotalY = 0;

const bPointRecoiledScreenCoord: THREE.Vector2 = new THREE.Vector2(); // 开火后后坐力影响后的弹点

/** 
 * 自动武器实体抽象类 
 */
export abstract class AutomaticWeapon implements CycleInterface, LoopInterface, WeaponInterface {

    private weaponSystem: WeaponSystem = WeaponSystem.getInstance(); // 武器系统
    private animationMixer: THREE.AnimationMixer; // 动画/网格混合器
    private weaponSkinnedMesh: THREE.SkinnedMesh; // 武器网格
    private camera: THREE.Camera = GameInstance.GameView.cameras.get(GameInstance.Cameras.playerCamera);
    private scene: THREE.Scene = GameWorld.scenes.get(Scenes.Handmodel);

    // 武器实例状态量

    lastFireTime: number = 0; // 上一次开火时间(ms)
    bulletLeftMagzine: number; // 当前弹夹子弹剩余
    bulletLeftTotal: number; // 总子弹剩余
    active: boolean = false; // 武器当前是否处于激活状态(当equip动画结束时武器进入active状态)

    // 武器属性

    weaponUUID = THREE.MathUtils.generateUUID(); // 该武器对象的唯一标识
    weaponType: WeaponType; // 武器类型
    weaponName: string; // 武器名字
    weaponNameSuffix: string; // 武器后缀名
    magazineSize: number; // 弹夹容量
    recoverTime: number; // 弹道恢复时间
    reloadTime: number;
    speed: number; // 手持移动速度
    killaward: number; // 击杀奖励
    damage: number; // 伤害
    fireRate: number; // 射速
    recoilControl: number; // 弹道控制
    accurateRange: number; // 在accurate range距离内第一发子弹必定会落到30cm内的标靶上
    armorPenetration: number; // 穿透能力

    // 自动武器属性

    recoverLine: number = 0; // 膛线
    bulletPosition: Array<number>; // 弹道弹点采样图2D转化为屏幕坐标采样点2D
    bulletPositionDelta: Array<number>; // 每发子弹偏移量
    bulletPositionInterpolant: THREE.LinearInterpolant; // 弹道图位点生成插值空间
    bulletPositionDeltaInterpolant: THREE.LinearInterpolant; // 弹道图变化量生成插值空间


    // 武器动画

    private equipAnim: THREE.AnimationAction;
    private reloadAnim: THREE.AnimationAction;
    private fireAnim: THREE.AnimationAction;
    private holdAnim: THREE.AnimationAction;
    private viewAnim: THREE.AnimationAction;

    /**
     * 构造方法
     * @param bulletPosition 自动步枪弹道位点图
     * @param bulletPositionDelta 每发子弹偏移量位点图
     */
    constructor(bulletPosition: Array<number>, bulletPositionDelta: Array<number>) {
        this.bulletPosition = bulletPosition;
        this.bulletPositionDelta = bulletPositionDelta;
    }

    init() {

        const positions = []; // 采样点
        for (let i = 0; i < this.magazineSize; i++) positions[i] = i * this.fireRate; // 29: 2.9000000000000004

        this.bulletPositionInterpolant = new THREE.LinearInterpolant(
            new Float32Array(positions), // parameterPositions
            new Float32Array(this.bulletPosition), // sampleValues
            2, // sampleSize
            new Float32Array(2) // resultBuffer
        );

        this.bulletPositionDeltaInterpolant = new THREE.LinearInterpolant(
            new Float32Array(positions), // parameterPositions
            new Float32Array(this.bulletPositionDelta), // sampleValues
            2, // sampleSize
            new Float32Array(2) // resultBuffer
        );

        // 监听键盘获取的武器事件
        iep.addEventListener(_inputEvent.type, (e: CustomEvent) => {

            switch (e.detail.type) {

                case InputEventTYPE.BUTTON_RELOAD: // 换弹按键

                    if (!this.active) return; // 1. 未激活状态下(如处于切枪过程中)不能进行换弹
                    if (this.magazineSize <= this.bulletLeftMagzine) return; // 2. 当前弹夹子弹是满的不能换弹
                    this.active = false;

                    _weaponAnimEvent.detail.type = WeaponEventTYPE.RELOAD;
                    _weaponAnimEvent.detail.weaponUUID = this.weaponUUID;
                    wep.dispatchEvent(_weaponAnimEvent); // 触发武器换弹动画

                    break;

                case InputEventTYPE.BUTTON_TRIGGLE_UP: // 扳机被抬起

                    if (!this.active) return;
                    if (this.bulletLeftMagzine > 0) return; // 如果扳机抬起时当前的子弹为0,那么会自动换弹

                    this.active = false;
                    _weaponAnimEvent.detail.type = WeaponEventTYPE.RELOAD;
                    _weaponAnimEvent.detail.weaponUUID = this.weaponUUID;
                    wep.dispatchEvent(_weaponAnimEvent); // 触发武器换弹动画

                    break;

            }

        })


    }

    /** 初始化动画 */
    initAnimation() {

        const equipAnimName = this.weaponName + '_equip'; // 装备
        const reloadAnimName = this.weaponName + '_reload'; // 换弹
        const fireAnimName = this.weaponName + '_fire'; // 开火
        const holdAnimName = this.weaponName + '_hold'; // 握持
        const viewAnimName = this.weaponName + '_view'; // 检视

        this.weaponSkinnedMesh = ResourceUtil.resources.get(this.weaponName); // 武器网格体
        this.animationMixer = ResourceUtil.resources.get('AnimationMixer'); // 动画混合器

        // 将网格体添加到系统中
        this.scene.add(this.weaponSkinnedMesh);

        this.equipAnim = ResourceUtil.resources.get(equipAnimName);
        if (this.equipAnim) this.equipAnim.loop = THREE.LoopOnce;
        this.reloadAnim = ResourceUtil.resources.get(reloadAnimName);
        if (this.reloadAnim) this.reloadAnim.loop = THREE.LoopOnce;
        this.fireAnim = ResourceUtil.resources.get(fireAnimName);
        if (this.fireAnim) this.fireAnim.loop = THREE.LoopOnce;
        this.holdAnim = ResourceUtil.resources.get(holdAnimName);
        if (this.holdAnim) this.holdAnim.loop = THREE.LoopRepeat; // 握持动画需要一直显示
        this.viewAnim = ResourceUtil.resources.get(viewAnimName);
        if (this.viewAnim) this.viewAnim.loop = THREE.LoopOnce;

        // 当部分动画结束 需要在回调中改变一些参数

        this.animationMixer.addEventListener('finished', (e: any) => {

            if (e.type === 'finished') {

                switch (e.action._clip.name) {

                    case equipAnimName: // 当装备动画结束
                        this.active = true; // 激活
                        break;

                    case reloadAnimName: // 当换弹动画结束
                        this.bulletLeftMagzine = this.magazineSize; // 子弹填满
                        this.active = true; // 激活
                        break;

                }

            }

        })

        // 接受武器事件回调处理动画

        wep.addEventListener(_weaponAnimEvent.type, (e: CustomEvent) => {

            if (e.detail.weaponUUID === this.weaponUUID) { // 只有当前武器的事件才给予响应

                switch (e.detail.type) {

                    case WeaponEventTYPE.RELIEVE_EQUIP:  // 解除装备
                        this.weaponSkinnedMesh.visible = false; // 武器不可见
                        this.active = false; // 未激活
                        this.animationMixer.stopAllAction(); // 关闭所有正在播放的动画
                        if (this.holdAnim) this.holdAnim.reset();
                        if (this.reloadAnim) this.reloadAnim.reset();
                        if (this.equipAnim) this.equipAnim.reset();
                        if (this.fireAnim) this.fireAnim.reset();
                        if (this.viewAnim) this.viewAnim.reset();
                        break;

                    case WeaponEventTYPE.EQUIP:  // 装备

                        this.weaponSkinnedMesh.visible = true; // 武器可见性
                        this.holdAnim.play();
                        this.equipAnim.weight = 49;
                        this.equipAnim.reset(); // 当前武器的装备动画
                        this.equipAnim.play();
                        this.active = false; // 装备动画播放时属于未激活状态
                        break;

                    case WeaponEventTYPE.FIRE: // 开火
                        this.fireAnim.weight = 49;
                        this.fireAnim.reset(); // 开火动画
                        this.fireAnim.play();
                        break;

                    case WeaponEventTYPE.RELOAD: // 换弹
                        this.reloadAnim.weight = 49;
                        this.reloadAnim.reset();
                        this.reloadAnim.play();
                        this.active = false; // 换弹时属于未激活状态
                        break;

                }

            }
        })
    }

    /** 开火 */
    fire() {

        // 如果进入过恢复状态

        if (!startRecover) {

            // 那么这次相机进入恢复状态的总改变量 初始化为上次恢复后的总改变量

            cameraRotateTotalX = recovercameraRotateTotalX;
            cameraRotateTotalY = recovercameraRotateTotalY;
        }

        // 提供基础弹点位置,基础弹点的位置出来的是屏幕坐标

        const floatTypedArray0 = this.bulletPositionInterpolant.evaluate(this.recoverLine); // 通过插值函数获取当前膛线点对应的基础位置
        bPointRecoiledScreenCoord.set(floatTypedArray0[0], floatTypedArray0[1]); // 提供武器精准度影响后的位置(武器精准度)
        const deltaRecoiledX = (1 / this.accurateRange) * (Math.random() - 0.5); // 修正公式: delta = 精准度倒数 * 随机±0.5
        const deltaRecoiledY = (1 / this.accurateRange) * Math.random(); // Y轴方向只会往上偏移因此一定是正的
        bPointRecoiledScreenCoord.x += deltaRecoiledX;
        bPointRecoiledScreenCoord.y += deltaRecoiledY;

        // 相机摆动基础(Y轴, 相机Pitch方向)

        const basicPitch = 0.02 * Math.PI * (1 / this.recoilControl);
        this.camera.rotation.x += basicPitch;
        cameraRotationBasicTotal += basicPitch; // 把相机收到变化的值记录起来

        // 相机摆动(弹道图)

        const floatTypedArray1 = this.bulletPositionDeltaInterpolant.evaluate(this.recoverLine);
        const deltaYaw = - floatTypedArray1[0] * Math.PI * (1 / this.recoilControl); // 弹道图向右为正方向,相机Yaw向右为负方向
        const deltaPitch = floatTypedArray1[1] * Math.PI * (1 / this.recoilControl);
        this.camera.rotation.x += deltaPitch;
        this.camera.rotation.y += deltaYaw; // 屏幕的x坐标对应的是相机的yaw
        cameraRotateTotalX += deltaPitch; // 把相机收到弹道图变化的值记录起来
        cameraRotateTotalY += deltaYaw;

        // 开火之后

        this.recoverLine += this.fireRate; // 1. 增加膛线插值
        this.bulletLeftMagzine -= 1; // 2. 减少子弹剩余量
        startRecover = true; // 开过枪之后下一帧可以是恢复准星的第一帧

        // 发出开火事件

        _weaponAnimEvent.detail.type = WeaponEventTYPE.FIRE;
        _weaponAnimEvent.detail.weaponUUID = this.weaponUUID;
        wep.dispatchEvent(_weaponAnimEvent); // 动画事件

        _weaponFireLogicEvent.detail.bPointRecoiledScreenCoord = bPointRecoiledScreenCoord;
        _weaponFireLogicEvent.detail.weapon = this;
        wep.dispatchEvent(_weaponFireLogicEvent); // 逻辑判断事件

        // 由于还没有做UI 打印一下子弹剩余量

        console.log(`fire: ${this.bulletLeftMagzine} / ${this.magazineSize}`);

    }

    /** 
     * 相机/准星 恢复
     */
    recover(deltaTime?: number, elapsedTime?: number): void {

        if (cameraRotationBasicTotal > 0) {
            if (cameraRotationBasicTotal - 0.001 > 0) {
                this.camera.rotation.x -= 0.001;
                cameraRotationBasicTotal -= 0.001;
            } else {
                this.camera.rotation.x -= cameraRotationBasicTotal;
                cameraRotationBasicTotal = 0;
            }
        }

        const triggleDown = this.weaponSystem.triggleDown;

        let deltaRecoverScale = deltaTime / this.recoverTime; // 每段deltaTime的recover量

        if (!triggleDown || this.bulletLeftMagzine <= 0 || !this.active) {// 如果鼠标没有按下或者这一帧刚好没子弹了

            if (startRecover) { // 如果这一帧是这次进入恢复状态的第一帧
                recovercameraRotateTotalX = cameraRotateTotalX; // 记录recovercameraRotateTotalX此次恢复需要恢复的总值
                recovercameraRotateTotalY = cameraRotateTotalY;
                startRecoverLine = this.recoverLine;
            }

            // 判断是否需要恢复准星
            if (this.recoverLine != 0) { // 需要恢复准星
                const recoverLineBeforeMinus = this.recoverLine;
                if (this.recoverLine - (deltaRecoverScale * startRecoverLine) > 0) this.recoverLine -= (deltaRecoverScale * startRecoverLine);
                else { // 如果下一帧就减到<0了
                    deltaRecoverScale = this.recoverLine / startRecoverLine;
                    this.recoverLine = 0; // 膛线插值恢复
                    cameraRotateTotalX = 0;
                    cameraRotateTotalY = 0;
                    recovercameraRotateTotalX = 0;
                    recovercameraRotateTotalY = 0;
                }
                const minusScale = recoverLineBeforeMinus - this.recoverLine;
                const recoverLineScale = minusScale / startRecoverLine;
                const deltaYaw = cameraRotateTotalY * recoverLineScale;
                const deltaPitch = cameraRotateTotalX * recoverLineScale;
                this.camera.rotation.x -= deltaPitch;
                this.camera.rotation.y -= deltaYaw; // 屏幕的x坐标对应的是相机的yaw
                recovercameraRotateTotalX -= deltaPitch;
                recovercameraRotateTotalY -= deltaYaw;
                startRecover = false; // 下一帧不是进入恢复状态的第一帧
            }
        }

    }


    callEveryFrame(deltaTime?: number, elapsedTime?: number): void {

        if (!WindowUtil.PointLock.isLocked) return; // PointLock
        if (!this.active) return; // 是否激活
        if (this.bulletLeftMagzine <= 0) return; // 剩余子弹
        if (!this.weaponSystem.triggleDown) return; // 3. 扳机被扣下
        if (performance.now() - this.lastFireTime >= this.fireRate * 1000) { // 4. 开火间隔
            this.lastFireTime = performance.now();
            this.fire();
        }

    }
}