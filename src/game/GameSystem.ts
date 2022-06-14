/** 
 * 游戏场景网格类型
 */
export enum GBDMaterial {

    PlayerHead, // 玩家的头
    PlayerChest, // 玩家胸膛
    PlayerLimb, // 玩家四肢
    PlayerBelly, // 玩家肚子

    GrassGround, // 草地

}

export enum GBDType {

    PlayerParts,
    SceneParts, // 场景部件

}

/** 判断该网格类型是否生成弹孔 */
export function judgeGBDType(type: GBDMaterial): GBDType {

    switch (type) {

        case GBDMaterial.GrassGround:
            return GBDType.SceneParts;

        case GBDMaterial.PlayerHead:
            return GBDType.PlayerParts;

        case GBDMaterial.PlayerChest:
            return GBDType.PlayerParts;

        case GBDMaterial.PlayerLimb:
            return GBDType.PlayerParts;

        case GBDMaterial.PlayerBelly:
            return GBDType.PlayerParts;

    }

}