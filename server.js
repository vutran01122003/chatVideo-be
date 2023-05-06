require('dotenv').config();
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const cors = require('cors');
const {Server} = require('socket.io');

const {PORT, CLIENT_URL} = process.env;
const io = new Server(server, {
 cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST']
 }
})

io.on('connection', (socket) => {
    socket.emit('me', socket.id);

    // Khi có user thoát khỏi socket thì socket sẽ bắt sự kiện disconnect và thông báo với những client còn lại
    socket.on('disconnect', () => {
        socket.broadcast.emit("callended");
    });

    // Khi user muốn gọi đến một user khác thì socket sẽ bắt sự kiện calluser
    // Sau đó io sẽ phát sự kiện calluser đến người được gọi (userToCall)
    socket.on("calluser", ({userToCall, signalData, from, name}) => {
        io.to(userToCall).emit("calluser", {signal: signalData, from, name});
    });

    // User phát sự kiện trả lời cuộc gọi (answercall)
    // io sẽ gửi đến sự kiện chấp nhận cuộc gọi (callaccepted) cùng với dữ liệu tín hiệu cuộc gọi đến người gọi
    socket.on("answercall", (data) => {
        io.to(data.to).emit("callaccepted", data.signal);
        io.to(data.to).emit("pedding", {});
    })
})


app.use(cors());

app.get('/', (req, res) => {
    res.send('home page');
})

server.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
})