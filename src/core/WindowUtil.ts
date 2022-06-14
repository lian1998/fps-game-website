import { GameInstance } from "./GameInstance";
import { lep, PointLockEventTYPE, _pointLockEvent } from '../viewlayers/LayerEventPipe';

const GameView = GameInstance.GameView;

export namespace WindowUtil {

    /** 浏览器指针锁定相关 */
    export class PointLock extends EventTarget {

        static isLocked: boolean = false; // 是否锁定

        /** 监听 pointlock 事件: onMouseChange, onPointerlockChange, onPointerlockError */
        static pointLockListen() {
            GameView.container.ownerDocument.addEventListener('mousemove', this.onMouseChange);
            GameView.container.ownerDocument.addEventListener('pointerlockchange', this.onPointerlockChange);
            GameView.container.ownerDocument.addEventListener('pointerlockerror', this.onPointerlockError);
        }

        /** 注销 pointlock 事件: onMouseChange, onPointerlockChange, onPointerlockError */
        static pointLockDispose = function () {
            GameView.container.ownerDocument.removeEventListener('mousemove', this.onMouseChange);
            GameView.container.ownerDocument.removeEventListener('pointerlockchange', this.onPointerlockChange);
            GameView.container.ownerDocument.removeEventListener('pointerlockerror', this.onPointerlockError);
        };

        static onMouseChange = (e: MouseEvent): void => {
            if (!PointLock.isLocked) return;
            _pointLockEvent.detail.type = PointLockEventTYPE.MOUSEMOVE;
            _pointLockEvent.detail.movementX = e.movementX;
            _pointLockEvent.detail.movementY = e.movementY;
            lep.dispatchEvent(_pointLockEvent);
        };

        static onPointerlockChange = function () {
            if (GameView.container.ownerDocument.pointerLockElement === GameView.container) {
                _pointLockEvent.detail.type = PointLockEventTYPE.LOCK;
                lep.dispatchEvent(_pointLockEvent);
                PointLock.isLocked = true;
            } else {
                _pointLockEvent.detail.type = PointLockEventTYPE.UNLOCK;
                lep.dispatchEvent(_pointLockEvent);
                PointLock.isLocked = false;
            }
        }

        static onPointerlockError = function () {
            console.error('THREE.PointerLockControls: Unable to use Pointer Lock API');
        }

        static unlock = function () { GameView.container.ownerDocument.exitPointerLock(); };
        static lock = function () { GameView.container.requestPointerLock(); };

    }
}

