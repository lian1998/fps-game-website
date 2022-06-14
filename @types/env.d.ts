/**
 * vite.envs 中配置的变量在编译器中没有typescript的types会报错
 * 此接口用于解决该问题
 */
interface ImportMetaEnv {
  [x: string]: any;
  VITE_RESOURCE_FOLDER: string
}

declare module "*?raw" {
  const value: string;
  export default value;
}