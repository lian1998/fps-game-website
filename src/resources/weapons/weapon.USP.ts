import * as THREE from 'three/build/three.module'
import { textureLoader, ResourceUtil } from '../ResourceUtil';

const texture = textureLoader.load('/weapons/weapon.USP.jpg');
ResourceUtil.dealWithWeaponTexture(texture);
const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });

export { material }