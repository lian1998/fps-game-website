import * as THREE from 'three/build/three.module';

import { ResourceUtil } from "@src/resources/ResourceUtil";
import { material } from "@src/resources/weapons/weapon.USP";
import { SemiAutomaticWeapon } from "@src/game/weapon/abstract/SemiAutomaticWeapon";
import { WeaponType } from "@src/game/weapon/WeaponSystem";

export class USP extends SemiAutomaticWeapon {

    muzzlePosition: THREE.Vector3 = new THREE.Vector3(0.887, 1.079, 0.494);
    chamberPosition: THREE.Vector3 = new THREE.Vector3(0.109, 1.101, 0.579);

    constructor() {

        super();

        const skinnedMesh = ResourceUtil.resources.get('USP');
        (<THREE.SkinnedMesh>skinnedMesh).material = material;

        this.weaponType = WeaponType.Pistol;
        this.weaponName = 'USP';
        this.magazineSize = 12;
        this.fireRate = 0.17;
        this.recoverTime = 0.34;
        this.reloadTime = 2.;
        this.recoilControl = 5;
        this.accurateRange = 120;

        this.bulletLeftMagzine = this.magazineSize;

        this.init();
        this.initAnimation();

    }

}