import * as THREE from 'three/build/three.module'

import { rep, _resourceLoaded } from "@src/resources/ResourceEventPipe";
import { gltfLoader } from '@src/resources/ResourceUtil'
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

/** 初始化资源 */
export const initResources = function () {

    //手部模型
    gltfLoader.load('/role/base/hand base.glb', function (gltf: GLTF) {

        const animationClips = gltf.animations;

        let armature: THREE.Object3D;

        gltf.scene.traverse(child => {

            if (child.name === 'Armature') {
                armature = child;
                _resourceLoaded.detail.name = child.name;
                _resourceLoaded.detail.obj = child;
                rep.dispatchEvent(_resourceLoaded);
            }

            if (child.type === "SkinnedMesh") {
                child.visible = false;
                _resourceLoaded.detail.name = child.name;
                _resourceLoaded.detail.obj = child;
                rep.dispatchEvent(_resourceLoaded);
            }

        })

        const animationMixer = new THREE.AnimationMixer(armature);
        _resourceLoaded.detail.name = 'AnimationMixer';
        _resourceLoaded.detail.obj = animationMixer;
        rep.dispatchEvent(_resourceLoaded);

        animationClips.forEach(animationClip => {

            const animationAction = animationMixer.clipAction(animationClip, armature);

            // 添加到资源管理
            _resourceLoaded.detail.name = animationClip.name;
            _resourceLoaded.detail.obj = animationAction;
            rep.dispatchEvent(_resourceLoaded);

        })

    })

    // 人物模型
    gltfLoader.load('/role/base/role base.glb', function (gltf) {

        _resourceLoaded.detail.name = 'Role';
        _resourceLoaded.detail.obj = gltf;
        rep.dispatchEvent(_resourceLoaded);

    })

    // 地图模型
    gltfLoader.load('/levels/mirage.glb', function (gltf) {

        _resourceLoaded.detail.name = 'Map';
        _resourceLoaded.detail.obj = gltf;
        rep.dispatchEvent(_resourceLoaded);

    });

}