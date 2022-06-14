import { initResources } from "./resources/InitResources";

/** 
 * 
 * 游戏加载顺序
 * 
 * 1. 调用InitResources方法, 该方法读取json数据解析映射需要加载的资源并请求这些资源
 * 2. 所有需要使用的资源都会被加载到ResourceUtil.resources中
 * 3. 加载完资源后会调用实现的ThreeJs的LoadingManager(staticMagager)的onLoad回调方法
 * 4. 回调方法调用ResourceUtil.loaded方法, 异步请求游戏的逻辑模块
 * 5. 游戏的逻辑模块中编写游戏的逻辑
 * 
 */

initResources(); // 目前没有实现json读取

