import { GameInstance } from "@src/core/GameInstance";
import { GameWorld, Scenes } from "@src/core/GameWorld";
import { CycleInterface } from "@src/core/interfaces/GameInterfaces";
import * as THREE from "three/build/three.module";
import { GBDType, judgeGBDType } from "@src/game/GameSystem";
import { WeaponInterface } from '@src/game/weapon/abstract/WeaponInterface';
import { wep, _weaponFireLogicEvent } from "./WeaponEventPipe";
import { lep, _bpointsEvent, _weaponFireEvent, _weaponTracerEvent } from "@src/viewlayers/LayerEventPipe";
import { iep, InputEventTYPE, _inputEvent } from "../input/InputEventPipe";

const vec3Util = new THREE.Vector3();

/** 
 * 武器类型 
 */
export enum WeaponType {
    Rifle, // 步枪
    SniperRifle, // 狙击步枪
    Pistol, // 手枪
    Malee, // 匕首
    SMG, // 微冲
    Shotgun, // 霰弹
    Machinegun, // 机枪
}

/** 
 * 武器系统, 处理武器系统对外事件:
 * 
 * 1. 通过事件获取开枪计算过后坐力后的子弹屏幕坐标位置; 获取相机位置, 通过相机设置激光; 计算弹点激光最终落点
 * 2. 判断击中物体的游戏逻辑材质, 对不同的物体采用不同的逻辑材质使用不同的逻辑事件
 * 3. 分发特效渲染事件
 * 4. 记录鼠标按键状态
 * 
 */
export class WeaponSystem implements CycleInterface {

    // 单例

    private static weaponSystemInstance: WeaponSystem;
    private constructor() { }
    public static getInstance() {
        if (!this.weaponSystemInstance) this.weaponSystemInstance = new WeaponSystem();
        return this.weaponSystemInstance;
    }

    // 成员变量

    camera: THREE.Camera; // 武器系统交互使用的相机
    levelScene: THREE.Scene; // 武器系统交互的场景
    _raycaster = new THREE.Raycaster(); // 用于激光检测
    _objectsIntersectedArray: Array<IntersectResult> = [];  // 用于存储激光检测的结果

    // 当前扳机状态

    triggleDown: boolean = false;

    init(): void {

        this.camera = GameInstance.GameView.cameras.get(GameInstance.Cameras.playerCamera);// 相机
        this.levelScene = GameWorld.scenes.get(Scenes.Level); // 用于检测子弹碰撞的场景

        iep.addEventListener(_inputEvent.type, (e: CustomEvent) => { // 玩家按键事件影响

            switch (e.detail.type) {

                // 扳机事件

                case InputEventTYPE.BUTTON_TRIGGLE_DOWN:
                    this.triggleDown = true;
                    break;
                case InputEventTYPE.BUTTON_TRIGGLE_UP:
                    this.triggleDown = false;
                    break;

            }

        })

        this.dealWithWeaponOpenFire();

    }

    /** 
     * 处理武器开火事件
     */
    dealWithWeaponOpenFire() {

        wep.addEventListener(_weaponFireLogicEvent.type, (e: CustomEvent) => {

            // 1. 向渲染层发出开火效果渲染事件

            if ((<WeaponInterface>e.detail.weapon).weaponType !== WeaponType.Malee) this.dispatchFireEffectEvent(); // 非匕首类型武器会产生特效

            // 2. 进行激光碰撞检测

            this._objectsIntersectedArray.length = 0; // 清空数组缓存
            let ifGenerated = false; // 标记是否已经生成过弹点
            const bpPointScreenCoord = e.detail.bPointRecoiledScreenCoord; // 子弹收到后坐力影响后在屏幕坐标的落点
            this._raycaster.setFromCamera(bpPointScreenCoord, this.camera); // 通过相机设置激光
            this._raycaster.params.Mesh.threshold = 1; // threshold是相交对象时光线投射器的精度，以世界单位表示
            this._raycaster.intersectObjects(this.levelScene.children, true, this._objectsIntersectedArray); // 检测

            // 渲染弹孔

            if (this._objectsIntersectedArray.length > 0) { // 如果击中了三角面

                for (let i = 0; i < this._objectsIntersectedArray.length; i++) { // 遍历所有的击中信息

                    if (ifGenerated) return; // 如果已经产生弹孔 就直接弹出方法不再产生弹孔

                    const point = this._objectsIntersectedArray[i].point; // 弹点
                    const gbdmtl = this._objectsIntersectedArray[i].object.userData['GBDMaterial'] // 用于判断碰撞面属于哪个(游戏逻辑)网格材质

                    if (gbdmtl === undefined) return; // 如果不是游戏逻辑内的材质不会生成弹点
                    const gbdType = judgeGBDType(gbdmtl); // 如果是游戏逻辑材质,就判断该材质类型

                    switch (gbdType) {

                        case GBDType.PlayerParts: // 如果是玩家身体的一部分
                            ifGenerated = true; // 不生成弹孔,且后续穿透也不会生成弹孔

                            // ... 这里应当发出玩家xxx被击中的事件

                            break;

                        case GBDType.SceneParts: // 如果是场景物体的一部分
                            if ((<WeaponInterface>e.detail.weapon).weaponType === WeaponType.Malee) break; // 如果当前持有武器类型是匕首那么不产生弹点

                            // 使用 addPoint 通用函数向场景中添加弹点
                            const normal = this._objectsIntersectedArray[i].face.normal;
                            this.dispatchBpointsEffectEvent(point, normal, this.camera.position, bpPointScreenCoord);
                            this.dispatchTracerEffectEvent(point);

                            ifGenerated = true; // 后续穿透不再生成弹孔
                            break;

                    }
                }

            }

            // 渲染曳光弹

            // if (this._objectsIntersectedArray.length > 0) {

            // } else {

            //     // vec3Util.copy(this._raycaster.ray.origin);
            //     // vec3Util.addScaledVector(this._raycaster.ray.direction, 300);
            //     // _weaponTracerEvent.detail.endPoint = vec3Util;
            //     // lep.dispatchEvent(_weaponTracerEvent);

            // }

        })

    }

    /** 
     * 给渲染层传递渲染事件(开火特效)
     */
    dispatchFireEffectEvent() {

        lep.dispatchEvent(_weaponFireEvent);

    }

    /** 
     * 发出需要渲染的子弹落点特效
     */
    dispatchBpointsEffectEvent(point: THREE.Vector3, normal: THREE.Vector3, cameraPoistion: THREE.Vector3, recoiledScreenCoord: THREE.Vector2) {

        _bpointsEvent.detail.point = point;
        _bpointsEvent.detail.normal = normal;
        _bpointsEvent.detail.cameraPosition = cameraPoistion;
        _bpointsEvent.detail.recoiledScreenCoord = recoiledScreenCoord;
        lep.dispatchEvent(_bpointsEvent);

    }

    /**
     * 曳光弹渲染
     */
    dispatchTracerEffectEvent(endPoint: THREE.Vector3) {

        _weaponTracerEvent.detail.endPoint = this._objectsIntersectedArray[0].point; // 弹点
        lep.dispatchEvent(_weaponTracerEvent);

    }

}