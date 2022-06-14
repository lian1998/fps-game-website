import * as THREE from 'three/build/three.module'

import { WeaponInterface } from "./WeaponInterface";
import { ResourceUtil } from '@src/resources/ResourceUtil';
import { GameWorld, Scenes } from '@src/core/GameWorld';
import { wep, WeaponEventTYPE, _weaponAnimEvent, _weaponFireLogicEvent } from '@src/game/weapon/WeaponEventPipe';
import { WindowUtil } from '@src/core/WindowUtil';
import { WeaponSystem, WeaponType } from '../WeaponSystem';
import { iep, InputEventTYPE, _inputEvent } from '@src/game/input/InputEventPipe';

const bPointRecoiledScreenCoord: THREE.Vector2 = new THREE.Vector2(); // 开火后后坐力影响后的弹点 匕首永远是屏幕中央

export class DaggerWeapon implements WeaponInterface {

    private animationMixer: THREE.AnimationMixer; // 动画/网格混合器
    private weaponSkinnedMesh: THREE.SkinnedMesh; // 武器网格
    private scene: THREE.Scene = GameWorld.scenes.get(Scenes.Handmodel);

    active: boolean;

    weaponType: WeaponType = WeaponType.Malee;
    weaponUUID: string = THREE.MathUtils.generateUUID();
    lastFireTime: number = 0; // 上一次开火时间
    bulletLeftMagzine: number;
    bulletLeftTotal: number;
    weaponName: string;
    weaponNameSuffix: string;
    magazineSize: number;
    recoverTime: number;
    reloadTime: number;
    speed: number;
    killaward: number;
    damage: number;
    fireRate: number = 0.5;
    recoilControl: number;
    accurateRange: number;
    armorPenetration: number;

    constructor() {

        // 监听键盘获取的武器事件
        iep.addEventListener(_inputEvent.type, (e: CustomEvent) => {

            if (_weaponAnimEvent.detail.weaponUUID === this.weaponUUID) {

                switch (e.detail.type) {

                    case InputEventTYPE.BUTTON_TRIGGLE_DOWN: // 当扳机被扣下

                        const performanceNow = performance.now();

                        if (!WindowUtil.PointLock.isLocked) return;
                        if (!this.active) return;
                        if (performanceNow - this.lastFireTime < this.fireRate * 1000) return;

                        this.lastFireTime = performanceNow;
                        _weaponAnimEvent.detail.type = WeaponEventTYPE.FIRE;
                        _weaponAnimEvent.detail.weaponUUID = this.weaponUUID;
                        wep.dispatchEvent(_weaponAnimEvent);

                        _weaponFireLogicEvent.detail.bPointRecoiledScreenCoord = bPointRecoiledScreenCoord;
                        _weaponFireLogicEvent.detail.weapon = this;
                        wep.dispatchEvent(_weaponFireLogicEvent);

                        break;
                }

            }

        })
    }

    // 武器动画

    private equipAnim: THREE.AnimationAction;
    private fireAnim: THREE.AnimationAction;
    private holdAnim: THREE.AnimationAction;
    private viewAnim: THREE.AnimationAction;


    /** 初始化动画 */
    initAnimation() {

        const equipAnimName = this.weaponName + '_equip'; // 装备
        const fireAnimName = this.weaponName + '_fire'; // 开火
        const holdAnimName = this.weaponName + '_hold'; // 握持
        const viewAnimName = this.weaponName + '_view'; // 检视

        this.weaponSkinnedMesh = ResourceUtil.resources.get(this.weaponName); // 武器网格体
        this.animationMixer = ResourceUtil.resources.get('AnimationMixer'); // 动画混合器

        // 将网格体添加到系统中
        this.scene.add(this.weaponSkinnedMesh);

        this.equipAnim = ResourceUtil.resources.get(equipAnimName);
        if (this.equipAnim) this.equipAnim.loop = THREE.LoopOnce;
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

                    case WeaponEventTYPE.FIRE:
                        this.fireAnim.weight = 49;
                        this.fireAnim.reset(); // 开火动画
                        this.fireAnim.play();
                        break;

                }

            }

        })
    }

}