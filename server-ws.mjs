import { createServer } from 'vite';

const vite = await createServer({
  server: { middlewareMode: 'ssr' },
  resolve: {
    alias: {
      '@assets': '/assets', // 静态文件库
      '@lib': '/lib', // 依赖库
      '@src': '/src', // 源码库
    }
  }
})

try {

  let { server } = await vite.ssrLoadModule('./server/main.ts');
  server.listen(3699);

} catch (e) {

  vite.ssrFixStacktrace(e); // Vite修复该
  console.error(e);

}