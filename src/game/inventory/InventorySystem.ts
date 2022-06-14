import { CycleInterface, LoopInterface } from "@src/core/interfaces/GameInterfaces";
import { iep, InputEventTYPE, _inputEvent } from '@src/game/input/InputEventPipe';
import { WeaponInterface } from "@src/game/weapon/abstract/WeaponInterface";
import { lep, _equipWeaponEvent } from "@src/viewlayers/LayerEventPipe";
import { judgeIventory } from "../weapon/utils/Weapons2Iventoryutils";
import { WeaponEventTYPE, wep, _weaponAnimEvent } from "../weapon/WeaponEventPipe";

/** 物品栏(武器槽位) */
export enum Inventory {
    NoWeapon, // 空手
    MainWeapon, // 主武器
    SecondaryWeapon, // 副武器
    DaggerWeapon, // 匕首
}

/**
 * 物品栏系统
 */
export class InventorySystem implements CycleInterface, LoopInterface {

    // 单例模式

    private static instance: InventorySystem;
    private constructor() { }
    public static getInstacne() {
        if (!InventorySystem.instance) InventorySystem.instance = new InventorySystem();
        return InventorySystem.instance;
    }

    weapons: Map<Inventory, WeaponInterface> = new Map<Inventory, WeaponInterface>(); // 武器列表,存储玩家当前所持有的所有武器
    nowEquipInventory: Inventory = Inventory.NoWeapon; // 当前装备的武器
    lastEquipInventory: Inventory = Inventory.DaggerWeapon; // 上一个装备的武器, 初始化时切换到匕首武器

    init(): void {

        // 初始化武器为空武器
        this.weapons.set(Inventory.NoWeapon, null);

        this.switchEquipment(Inventory.NoWeapon); // 装备武器 

        iep.addEventListener(_inputEvent.type, (e: CustomEvent) => { // 玩家按键事件影响

            switch (e.detail.type) {

                // 物品栏切换

                case InputEventTYPE.BUTTON_SWITCH_PRIMARY_WEAPON:
                    this.switchEquipment(Inventory.MainWeapon);
                    break;

                case InputEventTYPE.BUTTON_SWITCH_SECONDARY_WEAPON:
                    this.switchEquipment(Inventory.SecondaryWeapon);
                    break;

                case InputEventTYPE.BUTTON_SWITCH_DAGGER_WEAPON:
                    this.switchEquipment(Inventory.DaggerWeapon);
                    break;

                case InputEventTYPE.BUTTON_SWITCH_LAST_WEAPON:
                    this.switchEquipment(this.lastEquipInventory); // 上一次装备武器
                    break;

            }

        })

    }

    callEveryFrame(deltaTime?: number, elapsedTime?: number): void {

        // 准星恢复 必须和callEveryFrame分开计算 因为切枪后也会准星恢复

        this.weapons.forEach(weapon => { if (weapon && weapon.recover) weapon.recover(deltaTime, elapsedTime) });

        const nowEquipWeapon = this.weapons.get(this.nowEquipInventory);
        if (!nowEquipWeapon) return; // 如果当前没有装备任何武器那么就退出循环方法
        if (nowEquipWeapon.callEveryFrame) nowEquipWeapon.callEveryFrame(deltaTime, elapsedTime); // 当前装备的武器激活帧计算方法

    }



    /**
     * 切换到目标武器
     * @param inventory 目标武器栏位
     */
    switchEquipment(targetInventory: Inventory) {

        const nowEquipInventory = this.nowEquipInventory;

        if (nowEquipInventory !== targetInventory) { // 目前装备武器不和切换目标武器一样才执行动作

            // 发出解除旧武器的事件

            _weaponAnimEvent.detail.type = WeaponEventTYPE.RELIEVE_EQUIP;
            if (this.weapons.get(nowEquipInventory)) _weaponAnimEvent.detail.weaponUUID = this.weapons.get(nowEquipInventory).weaponUUID;
            wep.dispatchEvent(_weaponAnimEvent);

            // 发出装备新武器的事件

            _weaponAnimEvent.detail.type = WeaponEventTYPE.EQUIP;
            if (this.weapons.get(targetInventory)) _weaponAnimEvent.detail.weaponUUID = this.weapons.get(targetInventory).weaponUUID;
            wep.dispatchEvent(_weaponAnimEvent); // 武器系统层

            _equipWeaponEvent.detail.weaponInstance = this.weapons.get(targetInventory);
            lep.dispatchEvent(_equipWeaponEvent); // 渲染层

            this.nowEquipInventory = targetInventory;
            this.lastEquipInventory = nowEquipInventory;
        }

    }



    /** 
     * 从地面捡起武器 
     */
    pickUpWeapon(weaponInstance: WeaponInterface) {

        const belongInventory = judgeIventory(weaponInstance.weaponType); // 判断武器应该属于哪个槽位
        if (!this.weapons.get(belongInventory)) this.weapons.set(belongInventory, weaponInstance); // 如果当前武器栏位为空, 那么就将武器捡起

    }

}