import * as THREE from 'three/build/three.module';
import { rep } from "@src/resources/ResourceEventPipe";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

const resourceFolderMap = import.meta.env.VITE_RESOURCE_FOLDER; // vite 当前环境下资源的请求基础路径

// 所有非异步加载的资源使用这个资源管理器

const staticManager = new THREE.LoadingManager(
    function () { ResourceUtil.loaded(); },
    function (url: string, itemsLoaded: number, itemsTotal: number) { } // console.log(url, itemsLoaded, itemsTotal)
);

// loaders

const gltfLoader = new GLTFLoader(staticManager);
gltfLoader.setPath(resourceFolderMap);
const dracoLoader = new DRACOLoader(staticManager); // 使用draco点云算法
dracoLoader.setDecoderPath('/draco/');
gltfLoader.setDRACOLoader(dracoLoader);
const textureLoader = new THREE.TextureLoader(staticManager); // 材质读取
textureLoader.setPath(resourceFolderMap);

export { gltfLoader, textureLoader }

// resourceUtil

export class ResourceUtil {

    static resources: Map<string, Object> = new Map();

    static {

        // 当资源被加载 添加到管理容器中
        rep.addEventListener('resourceLoaded', function (e: CustomEvent) {
            ResourceUtil.resources.set(e.detail.name, e.detail.obj);
        })

    }

    /** MineCraft角色贴图为64X64bit贴图, 使用最近像素点过滤器意味着不需要生成mipmap */
    static dealWithRoleTexture(roleTexture: THREE.Texture) {

        roleTexture.generateMipmaps = false; // 不需要在显存中生成mipmap
        roleTexture.magFilter = THREE.NearestFilter;
        roleTexture.minFilter = THREE.NearestFilter;
        roleTexture.encoding = THREE.sRGBEncoding; // srgb编码
        roleTexture.flipY = false; // 不需要颠倒贴图

    }

    /** MineCraft角色材质需要开启AlphaHashed混合模式, 就是ThreeJs默认的Custom混合模式 */
    static dealWithRoleMaterial(roleMaterial: THREE.Material) {

        roleMaterial.side = THREE.FrontSide;
        roleMaterial.alphaTest = 1;

        // 使用threeJs默认的Custom混合模式

        roleMaterial.blending = THREE.CustomBlending;
        roleMaterial.blendEquation = THREE.AddEquation; //default
        roleMaterial.blendSrc = THREE.SrcAlphaFactor; //default
        roleMaterial.blendDst = THREE.OneMinusSrcAlphaFactor; //default

    }

    /** 处理武器贴图 */
    static dealWithWeaponTexture(weaponTexture: THREE.Texture) {

        weaponTexture.generateMipmaps = false;
        weaponTexture.magFilter = THREE.NearestFilter;
        weaponTexture.minFilter = THREE.NearestFilter;
        weaponTexture.encoding = THREE.sRGBEncoding;
        weaponTexture.flipY = false;

    }


    static loaded() {
        // import('../main').then(res => { })
        import('@src/initGameInstance').then(res => { })
    }

}