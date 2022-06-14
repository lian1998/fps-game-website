import ws from 'ws'

const wss = new ws.WebSocketServer({ noServer: true });

wss.on('connection', function (ws, req) {
    ws.send('client connected!');
    ws.on('message', function (message) {
        ws.send(`message back: ${message}`)
    })
})