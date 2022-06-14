class LayerEventPipe extends EventTarget { }
export const lep = new LayerEventPipe();

export enum PointLockEventTYPE { LOCK, UNLOCK, MOUSEMOVE };

// 客户端(浏览器)指针锁定事件
export const _pointLockEvent = new CustomEvent(
    'pointlock',
    {
        detail: {
            type: 0,
            movementX: 0,
            movementY: 0
        }
    }
);

// 武器确切开火事件
export const _weaponFireEvent = new CustomEvent('weapon fire', {})

// 场景弹孔渲染事件
export const _bpointsEvent = new CustomEvent(
    'scene bpoints',
    {
        detail: {
            point: null,
            normal: null,
            cameraPosition: null,
            recoiledScreenCoord: null,
        }
    }
);


export const _weaponTracerEvent = new CustomEvent(
    'weapon tracer',
    {
        detail: {
            endPoint: null,
        }
    }
);


// 装备新武器事件
export const _equipWeaponEvent = new CustomEvent(
    'equip waepon',
    {
        detail: {
            weaponInstance: null
        }
    }
);