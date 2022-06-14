import { CycleInterface } from "@src/core/interfaces/GameInterfaces";
import { iep, _inputEvent, InputEventTYPE } from "@src/game/input/InputEventPipe";

/** 
 * 处理玩家输入按键映射的控制器
 */
export class InputSystem implements CycleInterface {

    triggleDown: boolean = false; // 当前是否按下扳机

    init(): void {

        this.domEnviromentDefaultBinding();

    }

    /**
     * 浏览器环境下默认的按键绑定
     */
    domEnviromentDefaultBinding() {

        // 鼠标按键按下

        document.addEventListener('mousedown', (e: MouseEvent) => {

            if (e.button === 0) {

                _inputEvent.detail.type = InputEventTYPE.BUTTON_TRIGGLE_DOWN;
                iep.dispatchEvent(_inputEvent);

            }

        })

        // 鼠标按键抬起

        document.addEventListener('mouseup', (e: MouseEvent) => {

            if (e.button === 0) {

                _inputEvent.detail.type = InputEventTYPE.BUTTON_TRIGGLE_UP;
                iep.dispatchEvent(_inputEvent);

            }

        })

        // 键盘按键按下

        document.addEventListener('keydown', (e: KeyboardEvent) => {

            switch (e.code) {

                case 'KeyR':
                    _inputEvent.detail.type = InputEventTYPE.BUTTON_RELOAD;
                    iep.dispatchEvent(_inputEvent);
                    break;

                // 物品切换

                case 'Digit1':
                    _inputEvent.detail.type = InputEventTYPE.BUTTON_SWITCH_PRIMARY_WEAPON;
                    iep.dispatchEvent(_inputEvent);
                    break;

                case 'Digit2':
                    _inputEvent.detail.type = InputEventTYPE.BUTTON_SWITCH_SECONDARY_WEAPON;
                    iep.dispatchEvent(_inputEvent);
                    break;

                case 'Digit3':
                    _inputEvent.detail.type = InputEventTYPE.BUTTON_SWITCH_DAGGER_WEAPON;
                    iep.dispatchEvent(_inputEvent);
                    break;

                case 'KeyQ':
                    _inputEvent.detail.type = InputEventTYPE.BUTTON_SWITCH_LAST_WEAPON;
                    iep.dispatchEvent(_inputEvent);
                    break;

                // 玩家移动

                case 'KeyW':
                    _inputEvent.detail.type = InputEventTYPE.MOVE_FORWARD_DOWN;
                    iep.dispatchEvent(_inputEvent);
                    break;

                case 'KeyA':
                    _inputEvent.detail.type = InputEventTYPE.MOVE_LEFT_DOWN;
                    iep.dispatchEvent(_inputEvent);
                    break;

                case 'KeyS':
                    _inputEvent.detail.type = InputEventTYPE.MOVE_BACKWARD_DOWN;
                    iep.dispatchEvent(_inputEvent);
                    break;

                case 'KeyD':
                    _inputEvent.detail.type = InputEventTYPE.MOVE_RIGHT_DOWN;
                    iep.dispatchEvent(_inputEvent);
                    break;

                // 跳跃

                case 'Space':
                    _inputEvent.detail.type = InputEventTYPE.JUMP;
                    iep.dispatchEvent(_inputEvent);
                    break;

            }

        })


        // 键盘按键抬起

        document.addEventListener('keyup', (e: KeyboardEvent) => {

            switch (e.code) {

                case 'KeyW':
                    _inputEvent.detail.type = InputEventTYPE.MOVE_FORWARD_UP;
                    iep.dispatchEvent(_inputEvent);
                    break;

                case 'KeyA':
                    _inputEvent.detail.type = InputEventTYPE.MOVE_LEFT_UP;
                    iep.dispatchEvent(_inputEvent);
                    break;

                case 'KeyS':
                    _inputEvent.detail.type = InputEventTYPE.MOVE_BACKWARD_UP;
                    iep.dispatchEvent(_inputEvent);
                    break;

                case 'KeyD':
                    _inputEvent.detail.type = InputEventTYPE.MOVE_RIGHT_UP;
                    iep.dispatchEvent(_inputEvent);
                    break;

            }

        })

    }

}