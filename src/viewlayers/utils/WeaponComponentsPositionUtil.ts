import { GameInstance } from "@src/core/GameInstance";
import { lep, _equipWeaponEvent } from "@src/viewlayers/LayerEventPipe";
import * as THREE from 'three/build/three.module';

const v3Util = new THREE.Vector3();

const cameraLookAt = new THREE.Vector3(0, 0, -1); // default camera lookAt
const cameraUp = new THREE.Vector3(0, 1, 0); // default camera up

const chamberPositionUtil = new THREE.Vector3();
const muzzlePositionUtil = new THREE.Vector3();

/**
 * 获取当前 枪膛, 枪口 在世界坐标轴中的位置
 */
export class WeaponComponentsPositionUtil {

    static instance: WeaponComponentsPositionUtil;
    handModelCamera: THREE.Camera = GameInstance.GameView.cameras.get(GameInstance.Cameras.handModelCamera); // 获取当前手模相机的位置
    playerCamera = GameInstance.GameView.cameras.get(GameInstance.Cameras.playerCamera);

    chamberFrontDelta: number = 0;
    chamberRightDelta: number = 0;
    chamberDownDelta: number = 0;

    muzzleFrontDelta: number = 0;
    muzzleRightDelta: number = 0;
    muzzleDownDelta: number = 0;

    frontDirection = new THREE.Vector3();
    rightDirection = new THREE.Vector3();
    downDirection = new THREE.Vector3();

    private constructor() {

        // 计算出手部模型中枪膛位置转换到需要渲染场景的世界位置
        lep.addEventListener(_equipWeaponEvent.type, (e: CustomEvent) => { // 监听当前武器切换事件

            // 弹膛位置 

            if (_equipWeaponEvent.detail.weaponInstance && _equipWeaponEvent.detail.weaponInstance.chamberPosition) { // 如果存在更换的武器实例,判断是否有弹膛位置

                // 如果有弹膛位置就获取一下弹膛位置

                v3Util.copy(_equipWeaponEvent.detail.weaponInstance.chamberPosition);

                // 然后更新一下弹膛和枪口位置

                this.chamberFrontDelta = v3Util.x - this.handModelCamera.position.x;
                this.chamberRightDelta = v3Util.z - this.handModelCamera.position.z;
                this.chamberDownDelta = v3Util.y - this.handModelCamera.position.y;

            }

            // 枪口位置

            if (_equipWeaponEvent.detail.weaponInstance && _equipWeaponEvent.detail.weaponInstance.muzzlePosition) {

                v3Util.copy(_equipWeaponEvent.detail.weaponInstance.muzzlePosition);

                this.muzzleFrontDelta = v3Util.x - this.handModelCamera.position.x;
                this.muzzleRightDelta = v3Util.z - this.handModelCamera.position.z;
                this.muzzleDownDelta = v3Util.y - this.handModelCamera.position.y;

            }


        })
    }

    public static getInstance() {

        if (!WeaponComponentsPositionUtil.instance) WeaponComponentsPositionUtil.instance = new WeaponComponentsPositionUtil();
        return WeaponComponentsPositionUtil.instance;

    }

    /**
     * 计算弹膛位置
     * @returns 弹膛位置
     */
    public calculateChamberPosition(): THREE.Vector3 {

        // 在切枪事件中已经确定了如下变量: frontDelta, rightDelta, downDelta;

        // 计算方向 frontDirection, rightDirection, downDirection

        v3Util.copy(cameraLookAt);
        v3Util.applyEuler(this.playerCamera.rotation);
        v3Util.normalize();
        this.frontDirection.copy(v3Util);

        v3Util.copy(cameraUp);
        v3Util.applyEuler(this.playerCamera.rotation);
        v3Util.normalize();
        this.downDirection.copy(v3Util);

        v3Util.copy(this.frontDirection);
        v3Util.cross(this.downDirection);
        v3Util.normalize();
        this.rightDirection.copy(v3Util);

        // 渲染位置

        chamberPositionUtil.copy(this.playerCamera.position);
        chamberPositionUtil.addScaledVector(this.frontDirection, this.chamberFrontDelta); // 向前
        chamberPositionUtil.addScaledVector(this.rightDirection, this.chamberRightDelta); // 右方
        chamberPositionUtil.addScaledVector(this.downDirection, this.chamberDownDelta); // 下方

        return chamberPositionUtil;

    }

    /**
     * 计算枪口位置
     * @returns 枪口位置
     */
    public calculateMuzzlePosition(): THREE.Vector3 {

        // 在切枪事件中已经确定了如下变量: frontDelta, rightDelta, downDelta;

        // 计算方向 frontDirection, rightDirection, downDirection

        v3Util.copy(cameraLookAt);
        v3Util.applyEuler(this.playerCamera.rotation);
        v3Util.normalize();
        this.frontDirection.copy(v3Util);

        v3Util.copy(cameraUp);
        v3Util.applyEuler(this.playerCamera.rotation);
        v3Util.normalize();
        this.downDirection.copy(v3Util);

        v3Util.copy(this.frontDirection);
        v3Util.cross(this.downDirection);
        v3Util.normalize();
        this.rightDirection.copy(v3Util);

        // 渲染位置

        muzzlePositionUtil.copy(this.playerCamera.position);
        muzzlePositionUtil.addScaledVector(this.frontDirection, this.muzzleFrontDelta); // 向前
        muzzlePositionUtil.addScaledVector(this.rightDirection, this.muzzleRightDelta); // 右方
        muzzlePositionUtil.addScaledVector(this.downDirection, this.muzzleDownDelta); // 下方

        return muzzlePositionUtil;

    }

}