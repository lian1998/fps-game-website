import * as THREE from 'three/build/three.module'

import { Octree } from 'three/examples/jsm/math/Octree';

export enum Scenes {
    Skybox,
    Level,
    Collision,
    Handmodel,
    UI,
    Sprites
}

/** 
 * SceneGraphs
 */
class GameWorld {

    /** 碰撞检测树 */
    static worldOctree = new Octree();

    static scenes: Map<Scenes, THREE.Scene> = new Map<Scenes, THREE.Scene>();

    static {
        this.scenes.set(Scenes.Skybox, new THREE.Scene());
        this.scenes.set(Scenes.Level, new THREE.Scene());
        this.scenes.set(Scenes.Collision, new THREE.Scene());
        this.scenes.set(Scenes.Handmodel, new THREE.Scene());
        this.scenes.set(Scenes.UI, new THREE.Scene());
        this.scenes.set(Scenes.Sprites, new THREE.Scene());
    }

}

export { GameWorld }