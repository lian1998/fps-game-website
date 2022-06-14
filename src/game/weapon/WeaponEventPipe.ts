class WeaponEventpipe extends EventTarget { }

export const wep = new WeaponEventpipe();

/** 武器状态切换逻辑事件 */
export enum WeaponEventTYPE { HOLD, EQUIP, RELIEVE_EQUIP, FIRE, RELOAD, PICKUP }

/** 武器动画事件 */
export const _weaponAnimEvent = new CustomEvent(
    'weapon animation',
    {
        detail: {
            type: 0,
            weaponUUID: null // 该事件会发出指定的weaponUUID,只有当前武器会处理该指令
        }
    }
);

/** 武器开火逻辑事件: 只有开火了才会发出此事件 */
export const _weaponFireLogicEvent = new CustomEvent(
    'weapon fire',
    {
        detail: {
            bPointRecoiledScreenCoord: null,
            weapon: null
        }
    }
)
