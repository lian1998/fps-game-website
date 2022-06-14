import * as THREE from 'three/build/three.module';

import { AutomaticWeaponBPointsUtil } from "../utils/AutomaticWeaponBPointsUtil";
import { material } from "@src/resources/weapons/weapon.AK47";
import { ResourceUtil } from "@src/resources/ResourceUtil";
import { AutomaticWeapon } from "@src/game/weapon/abstract/AutomaticWeapon";
import { WeaponType } from "@src/game/weapon/WeaponSystem";

const ak47BulletPositionArray = [
    222, 602, 230, 585, 222, 540, 228, 472, 231, 398,
    200, 320, 180, 255, 150, 208, 190, 173, 290, 183,
    343, 177, 312, 150, 350, 135, 412, 158, 420, 144,
    323, 141, 277, 124, 244, 100, 179, 102, 100, 124,
    149, 130, 134, 123, 149, 100, 170, 92, 125, 100,
    110, 87, 160, 88, 237, 95, 346, 147, 381, 146
]

const bulletPosition = AutomaticWeaponBPointsUtil.bulletPositionArray2ScreenCoordArray(ak47BulletPositionArray, 30, 0.2, 0.15, 1.4); // 计算弹道图
const bulletPositionDelta = AutomaticWeaponBPointsUtil.bulletDeltaPositionArray2ScreenCoordArray(ak47BulletPositionArray, 30, 0.2, 0.15, 1); // 影响相机抖动

export class AK47 extends AutomaticWeapon {

    muzzlePosition: THREE.Vector3 = new THREE.Vector3(0.921, 1.057, 0.491);
    chamberPosition: THREE.Vector3 = new THREE.Vector3(-0.276, 1.086, 0.565);

    skinnedMesh: THREE.SkinnedMesh;

    constructor() {

        super(bulletPosition, bulletPositionDelta);

        this.skinnedMesh = ResourceUtil.resources.get('AK47');
        (<THREE.SkinnedMesh>this.skinnedMesh).material = material;

        this.weaponType = WeaponType.Rifle;
        this.weaponName = 'AK47';
        this.magazineSize = 30;
        this.fireRate = 60 / 600.0;
        this.recoverTime = 0.368;
        this.reloadTime = 2.;
        this.recoilControl = 4;
        this.accurateRange = 120;

        this.bulletLeftMagzine = this.magazineSize;
        this.bulletLeftTotal = 90;

        this.init();
        this.initAnimation();

    }

}