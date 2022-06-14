import connect from 'connect';
import http from 'http';
import url from 'url';
import vite from 'vite';

// 矛盾点在于
// 1. 开启html服务的vite无法收到请求
// 2. 将vite作为ssr服务器, 每次请求时用esbuild编译一次server出来

export default function ViteWsPlugin() {

    const app = connect();
    const server = http.createServer(app);
    let viteDevServer: vite.ViteDevServer; // 所使用的vite服务对象
    let logger: vite.Logger; // 日志打印

    return {
        name: 'vite-ws-plugin',

        configureServer: (serverReturn: vite.ViteDevServer) => {
            viteDevServer = serverReturn;
            logger = serverReturn.config.logger;
            try {
                server.on('upgrade', async function upgrade(request, socket, head) {
                    const { pathname } = url.parse(request.url);
                    if (pathname === '/wstest') {
                        let { wss } = await viteDevServer.ssrLoadModule('./server/ws.test.ts');
                        wss.handleUpgrade(request, socket, head, async function done(ws) {
                            wss.emit('connection', ws, request);
                        });
                    }
                    else socket.destroy();
                });
            } catch (e) {
                viteDevServer.ssrFixStacktrace(e);
                console.log(e);
            }

            server.listen(3699, function () {
                logger.info('serverWs start at http://localhost:3699/')
            });

        }

    }

}