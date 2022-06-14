

import { Inventory } from "@src/game/inventory/InventorySystem";
import { WeaponType } from "@src/game/weapon/WeaponSystem";

/**
 * 判断对应的武器类型属于的武器槽位
 * @param type :WeaponType 武器类型
 * @returns :Inventory 武器槽位
 */
export function judgeIventory(type: WeaponType): Inventory {
    switch (type) {
        case WeaponType.Rifle:
            return Inventory.MainWeapon;
        case WeaponType.SniperRifle:
            return Inventory.MainWeapon;
        case WeaponType.Pistol:
            return Inventory.SecondaryWeapon;
        case WeaponType.Malee:
            return Inventory.DaggerWeapon;
        case WeaponType.SMG:
            return Inventory.MainWeapon;
        case WeaponType.Shotgun:
            return Inventory.MainWeapon;
        case WeaponType.Machinegun:
            return Inventory.MainWeapon;
    }
}