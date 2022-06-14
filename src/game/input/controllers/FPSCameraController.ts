import * as THREE from 'three/build/three.module'
import { GameInstance } from "@src/core/GameInstance";
import { CycleInterface } from "@src/core/interfaces/GameInterfaces";
import { lep, PointLockEventTYPE } from "@src/viewlayers/LayerEventPipe";

const mouseConfig = { // 鼠标参数配置
    dpi: 1000,
    mouseSensitivity: 0.5
}

const _PI_2 = Math.PI / 2; // PI/2

/**
 * FPS 相机控制类
 * 改变相机轴序'YXZ'; Y轴Yaw,左y+,右y-; X轴Pitch,上x+,下x-
 */
export class FPSCameraController extends EventTarget implements CycleInterface {

    domElement: HTMLElement;
    camera: THREE.Camera;

    init(): void {

        this.camera = GameInstance.GameView.cameras.get(GameInstance.Cameras.playerCamera);

        // 轴向使用YXZ主要有下面的好处 ThreeJscamera是Yup的,因此YXZ第一个值代表着水平运动契合screenCoord的XY坐标

        this.camera.rotation.order = 'YXZ';

        this.domElement = GameInstance.GameView.container;

        const scope = this;

        lep.addEventListener('pointlock', function (e: CustomEvent) {

            switch (e.detail.type) {

                case PointLockEventTYPE.MOUSEMOVE:
                    // 计算参数
                    const { dpi, mouseSensitivity } = mouseConfig;

                    // 屏幕两轴右下角为正方向
                    const screenTrasformX = e.detail.movementX / dpi * mouseSensitivity; // 屏幕横坐标
                    const screenTrasformY = e.detail.movementY / dpi * mouseSensitivity; // 屏幕纵坐标

                    // 改变相机位置
                    scope.camera.rotation.y = scope.camera.rotation.y - screenTrasformX;
                    scope.camera.rotation.x = Math.max(
                        _PI_2 - Math.PI,
                        Math.min(_PI_2 - 0, scope.camera.rotation.x - screenTrasformY)
                    );
                    break;

            }

        })

    }

}