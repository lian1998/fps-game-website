import '@src/viewlayers/css/pointlock.css'

import { CycleInterface, LoopInterface } from '@src/core/interfaces/GameInterfaces'
import { GameInstance } from '@src/core/GameInstance';
import { WindowUtil } from '@src/core/WindowUtil';
import { lep, PointLockEventTYPE, _pointLockEvent } from '@src/viewlayers/LayerEventPipe';

import Stats from 'three/examples/jsm/libs/stats.module';

const pointLockHtml = /*html*/`
<div id="blocker">
    <div id="instructions">
        <p style="font-size:36px">
            点击游玩
        </p>
        <p>
            移动: W&nbsp;A&nbsp;S&nbsp;D<br/>
            跳跃: 空格<br/>
            开火: 鼠标左键<br/>
            主武器: 数字1<br/>
            副武器: 数字2<br/>
            匕首: 数字3<br/>
            上一次使用武器: q<br/>
        </p>
    </div>
</div>
`

document.body.innerHTML += pointLockHtml;

// 选取html中的元素

const blocker = document.getElementById('blocker'); // 锁定效果
const instructions = document.getElementById('instructions'); // 指引

const container = GameInstance.GameView.container; // 装载画面的容器


/**
 * Dom元素的交互层
 * 控制是否在网页中显示webgl输出, 以及UI事件接口
 */
export class DOMLayer extends EventTarget implements CycleInterface, LoopInterface {

    name: string = 'dom layer'
    stats: any;

    init(): void {

        // 将渲染器出图挂载到某个HTML页面容器上
        container.appendChild(GameInstance.GameView.renderer.domElement);

        // 监听锁定图层, 点击图层后锁定指针
        WindowUtil.PointLock.pointLockListen();

        instructions.addEventListener('click', function () { if (!WindowUtil.PointLock.isLocked) WindowUtil.PointLock.lock(); });

        // 通过事件通道接收事件
        lep.addEventListener(_pointLockEvent.type, function (e: CustomEvent) {
            switch (e.detail.type) {
                case PointLockEventTYPE.LOCK: // 锁定事件
                    instructions.style.display = 'none';
                    blocker.style.display = 'none';
                    break;
                case PointLockEventTYPE.UNLOCK: // 解锁事件
                    blocker.style.display = 'block';
                    instructions.style.display = '';
                    break;
            }
        });

        this.stats = Stats();
        GameInstance.GameView.container.appendChild(this.stats.dom);
    }

    callEveryFrame(deltaTime?: number, elapsedTime?: number): void {
        this.stats.update();
    }

}