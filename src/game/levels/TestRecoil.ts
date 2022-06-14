import { GameInstance } from "@src/core/GameInstance";
import { GameWorld, Scenes } from "@src/core/GameWorld";
import { CycleInterface, LoopInterface } from "@src/core/interfaces/GameInterfaces";
import * as THREE from "three/build/three.module";
import { GBDMaterial } from "../GameSystem";


/** 后坐力测试 */
export class TestRecoil implements CycleInterface, LoopInterface {

    init(): void {

        // 相机位置
        const playerCamera = GameInstance.GameView.cameras.get(GameInstance.Cameras.playerCamera);
        playerCamera.lookAt(new THREE.Vector3(0, 0, 0));
        playerCamera.position.z = 5;

        // 弹点显示
        const scene = GameWorld.scenes.get(Scenes.Sprites);
        const planeG = new THREE.PlaneGeometry(15, 15);
        const planeM = new THREE.Mesh(planeG, new THREE.MeshBasicMaterial());
        planeM.position.z -= 2;
        planeM.userData['GBDMaterial'] = GBDMaterial.GrassGround;
        planeM.name = 'scene parts';
        scene.add(planeM);

        const axesHelper = new THREE.AxesHelper(20);
        scene.add(axesHelper);
    }

    callEveryFrame(deltaTime?: number, elapsedTime?: number): void {

    }

}