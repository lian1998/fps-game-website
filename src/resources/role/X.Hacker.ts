import * as THREE from "three/build/three.module";
import { textureLoader, ResourceUtil } from '../ResourceUtil';

const roleTexture = textureLoader.load('/role/role.HACKER-on-planetminecraft-com.png');
ResourceUtil.dealWithRoleTexture(roleTexture);

const roleMaterial = new THREE.MeshBasicMaterial({ map: roleTexture });
ResourceUtil.dealWithRoleMaterial(roleMaterial);

export { roleMaterial }