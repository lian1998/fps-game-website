

# 文档

https://vitejs.dev/
https://marmoset.co/

# 工具/资源

https://www.planetminecraft.com/pmcskin3d/
https://clara.io/library
https://krunker.io/
http://skin.minecraftxz.com/
http://www.opengl-tutorial.org/beginners-tutorials/tutorial-3-matrices/

# 技术帖

https://blog.csdn.net/qq_45236230/article/details/105838172



# 视频

blender 动画: https://www.bilibili.com/video/BV1Aq4y1U7kX?from=search&seid=14774165241679834649&spm_id_from=333.337.0.0

blender 入门: https://www.bilibili.com/video/BV1zh411Y7LX

Three.js Journey: https://www.bilibili.com/video/BV1Pf4y177Vp

持枪视角 https://www.bilibili.com/video/BV13x411q7Df?from=search&seid=2495456012265792169&spm_id_from=333.337.0.0

换单动画 https://www.bilibili.com/video/BV1KW411J76f/


# 备忘录

1. 曳光弹 LineSegments, 查看 LineBasicMaterial 的 shader 代码, 改造一下
2. 击中目标的判断
3. 资源加载, 资源管理系统
4. 玩家系统
5. 开枪动画, 切枪动画, 开枪贴图(两个放射性火花, 烟雾, 弹壳)
6. 准星系统

# 补
gsap 是一个ticker动画框架

# safari不能全屏解决办法:

```javascript
const fullscreenElement = document.fullscreenElement || document.webkitFullScreenElement;

if (!fullscreenElement) {
    canvas.requestFullScreen(); // 此API用于将canvas全屏
    document.exitFullScreen(); // 退出全屏
}
```

# 画布全屏问题 

```javascript
const canvas = document.querySelector('canvas.webgl')
```

```css
// 苹果浏览器会在canvas周围有一圈蓝边
.webgl {
    position: fixed
    top: 0
    left: 0
    outline: none
}

// 苹果浏览器下拉特效是超过元素总高度的
html,
body {
    overflow: hidden
}
```


# 更好的处理图片资源

```javascript
const image = new Image();

image.onload = () => {
    const texture = new THREE.Texture(image);
    console.log('image loaded, translate into tjs.Texture: ', texture);
}

image.src = '/textures/door/color.jpg'
```

反闭包方法:

```javascript
const image = new Image();
const texture = new THREE.Texture(image);

image.onload = () => {
    texture.needsUpdate = true;
    console.log('image loaded, translate into tjs.Texture: ', texture);
}

image.src = '/textures/door/color.jpg'
```

# Layers

1. layers穿透父子关系(不影响父子级关系)
2. 构造的时候自带了, 没必要替换成自己的
3. camera 和 object3D 处于同一个layer才行 (scene 和layer无关)
4. layers和visiable都不会影响最终输出画面的shadowmap

> layers 主要目的应该就是给不同的物体设计不同的层级, 切换层级时可以屏蔽一部分物体; 其他时候都可以不用;


# renderOrder
这个值将使得scene graph（场景图）中默认的的渲染顺序被覆盖， 即使不透明对象和透明对象保持独立顺序。 渲染顺序是由低到高来排序的，默认值为0。


# 注意点
1. 比例很重要
2. 做之前先想好项目的层数, 需要多少场景, 多少相机, 阴影怎么做, 工作流?
3. 初步搭建架构


# 性能优化

加载/读取性能
1. textures 取消mipmap
2. 同一张 texture 的 rgba通道分别存储不同的信息
3. basis, webp压缩

实时渲染性能
3. 减少drawcall

# 材质
1. map: 基础色
2. aoMap: (aoMapIntensity) 受到环境光R通道影响的程度
3. displacementMap: (displacementScale) 置换(直接改变顶点位置, 需要细分网格)
4. metalnessMap: 金属度
5. roughnessMap: 粗糙度
6. normalMap: (normalScale) 改变法线角度
7. EnvironmentMap: 周围接受到的环境光影响


# gltf

1. gltf
2. gltf.binary(glb)
3. gltf.draco
4. gltf.embedded