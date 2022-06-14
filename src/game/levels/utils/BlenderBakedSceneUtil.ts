import * as THREE from "three/build/three.module";

export class BlenderBakedSceneUtil {

    /**
     * changeEncoding & flipY
     * 使用Blender做场景并导出时需要将贴图的编码转化成SRGB
     * 并且材质在导入到显卡buffer时不需要翻转图片
     * 
     * @param Object3D 物体
     * @param texture 材质图片
     */
    static dealBakedTexture(Object3D: THREE.Object3D, texture: THREE.Texture) {

        texture.encoding = THREE.sRGBEncoding;
        texture.flipY = false;

        const mtl = new THREE.MeshBasicMaterial({ map: texture });
        Object3D.material = mtl;

    }

    /**
     * 对某网格实例(包括其孩子)开启8x各向异性读取贴图
     * @param mesh 
     */
    static anisotropy8x(mesh: THREE.Object3D) {

        mesh.traverse((child: THREE.Object3D) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material.map) child.material.map.anisotropy = 8;// 材质开启采样(8x各向异性)
            }
        });

    }

}