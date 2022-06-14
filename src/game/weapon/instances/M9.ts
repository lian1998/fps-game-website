import { ResourceUtil } from "@src/resources/ResourceUtil";
import { material } from '@src/resources/weapons/weapon.M9'
import { DaggerWeapon } from "@src/game/weapon/abstract/DaggerWeapon";

export class M9 extends DaggerWeapon {

    constructor() {

        super();

        const skinnedMesh = ResourceUtil.resources.get('M9');
        (<THREE.SkinnedMesh>skinnedMesh).material = material;

        this.weaponName = 'M9';

        this.initAnimation();

    }

}