import { defineConfig } from 'vite';

import json from '@rollup/plugin-json';
import ViteWsPlugin from './@plugins/vite-ws-plugin'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  return {
    base: '/',
    mode: 'development',
    publicDir: 'public',
    cacheDir: 'node_modules/.vite',
    assetsInclude: ['*.vert', '*.frag', '*.glsl'], // 支持的资源类型列表
    logLevel: 'info',
    envDir: './vite.envs', // 加载.env文件的目录
    build: {
      target: 'modules',
      polyfillModulePreload: true, // 是否注入modulepreload的polyfill
      // outDir: './dist', // root/build
      outDir: './projects/weapons',
      assetsDir: './assets', // root/build/assets 
      assetsInlineLimit: 40960, // 小于40kb的文件会被打包成base64
      sourcemap: false,
      minify: 'terser',
    },
    resolve: { // 导入资源模块时解析
      dedupe: [],
      conditions: [],
      mainFields: ['module', 'jsnext:main', 'jsnext'],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
      alias: {
        '@assets': '/assets', // 静态文件库
        '@lib': '/lib', // 依赖库
        '@src': '/src', // 源码库
      },
    },
    server: {
      host: '127.0.0.1',
      port: 3000,
      strictPort: false,
      https: false,
      open: './index.html',
      proxy: {}, // 代理
      cors: true
    },
    plugins: [
      json({
        preferConst: true, // 使用const声明
        compact: true, // 忽略缩进压缩代码
        namedExports: true // 为json对象所有属性都生成命名
      }),
      ViteWsPlugin()
    ]
    // https://cn.vitejs.dev/guide/api-plugin.html 自己开发插件查看钩子文档
    // https://vitejs.cn/awesome/#framework-agnostic-plugins 使用社区插件 
  }
})