import { CycleInterface } from '@src/core/interfaces/GameInterfaces'
import { ResourceUtil, textureLoader } from '@src/resources/ResourceUtil';
import { GameWorld, Scenes } from '@src/core/GameWorld';

import * as THREE from 'three/build/three.module'
import { Octree } from 'three/examples/jsm/math/Octree';
import { BlenderBakedSceneUtil } from './utils/BlenderBakedSceneUtil';
import { GBDMaterial } from '../GameSystem';

class LevelMirage implements CycleInterface {

    init(): void {

        const levelScene = GameWorld.scenes.get(Scenes.Level);
        const collisionScene = GameWorld.scenes.get(Scenes.Collision);

        const octTree: Octree = GameWorld.worldOctree;
        const bakedTexture = textureLoader.load('/levels/t.mirage.baked.75.jpg');

        const gltf: THREE.GLTF = ResourceUtil.resources.get('Map');
        const levelMesh = gltf.scene.children[0]; // 需要渲染的网格
        const physicsMesh = gltf.scene; // 需要计算物理信息的场景
        octTree.fromGraphNode(physicsMesh); // 将物理信息加载到内存中

        BlenderBakedSceneUtil.dealBakedTexture(levelMesh, bakedTexture); // 使用工具给渲染网格绑定材质

        levelMesh.userData['GBDMaterial'] = GBDMaterial.GrassGround;
        levelScene.add(levelMesh)

        // 根据blender导出的光源信息绑定ThreeJs光源
        // const hemisphereLight = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
        // hemisphereLight.position.set(0.5, 1, 0.75);
        // scope.scene.add(hemisphereLight);
        // const ambientLight = new THREE.AmbientLight(0x404040);
        // scope.scene.add(ambientLight);
        // const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        // directionalLight.position.set(-10, 10, 5);
        // directionalLight.castShadow = true;
        // var d = 10;
        // directionalLight.shadow.camera.left = -d;
        // directionalLight.shadow.camera.right = d;
        // directionalLight.shadow.camera.top = d;
        // directionalLight.shadow.camera.bottom = -d;
        // directionalLight.shadow.camera.near = 2;
        // directionalLight.shadow.camera.far = 2;
        // directionalLight.shadow.mapSize.x = 1024;
        // directionalLight.shadow.mapSize.y = 1024;
    }

}

export { LevelMirage }