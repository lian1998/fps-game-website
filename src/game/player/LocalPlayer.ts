import { CycleInterface, LoopInterface } from "@src/core/interfaces/GameInterfaces";

import { InputSystem } from "@src/game/input/InputSystem";

import { roleMaterial } from '@src/resources/role/TF2.Heavy';
import { AccMovementController } from "@src/game/input/controllers/AccMovementController";
import { MovementController } from '@src/game/input/controllers/MovementController';
import { FPSCameraController } from "@src/game/input/controllers/FPSCameraController";
import { Inventory, InventorySystem } from "@src/game/inventory/InventorySystem";
import { WeaponSystem } from "@src/game/weapon/WeaponSystem";

import { AK47 } from "../weapon/instances/AK47";
import { USP } from "../weapon/instances/USP";
import { M9 } from "../weapon/instances/M9";

/**
 * 本地玩家
 */
export class LocalPlayer implements CycleInterface, LoopInterface {

    name: string = 'local player';

    inputSystem: InputSystem; // 处理输入事件
    inventorySystem: InventorySystem; // 处理物品栏信息
    weaponSystem: WeaponSystem; // 处理武器信息(弹道计算,落点计算,武器动画)

    cameraController: FPSCameraController; // 相机控制器
    movementController: MovementController; // 位移控制器

    roleMaterial: THREE.Material = roleMaterial; // 玩家网格当前的材质(角色)

    init(): void {

        // 控制器初始化

        this.inputSystem = new InputSystem();
        this.inputSystem.init();

        this.cameraController = new FPSCameraController();
        this.cameraController.init();

        this.inventorySystem = InventorySystem.getInstacne();
        this.inventorySystem.init();

        this.weaponSystem = WeaponSystem.getInstance();
        this.weaponSystem.init();

        this.movementController = new MovementController();
        this.movementController.init();

        // 枪械初始化
        const ak47 = new AK47(); // 生成一把AK
        this.inventorySystem.pickUpWeapon(ak47); // 捡起AK
        const usp = new USP(); // 生成USP
        this.inventorySystem.pickUpWeapon(usp); // 捡起USP
        const m9 = new M9(); // 生成USP
        this.inventorySystem.pickUpWeapon(m9); // 捡起USP
        this.inventorySystem.switchEquipment(Inventory.MainWeapon);

    }

    callEveryFrame(deltaTime?: number, elapsedTime?: number): void {

        this.inventorySystem.callEveryFrame(deltaTime, elapsedTime);
        this.movementController.callEveryFrame(deltaTime, elapsedTime);

    }

}