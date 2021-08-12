const express = require('express');
const http = require('http')
const socketio = require('socket.io');

const cors = require('cors');
const router = require('./router');
const { addUser,removeUser, getUsersInRoom, getUser} = require('./users');

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);

const corsOptions = {
    cors : true,
    origins : ["https://localhost:3000"],
    credential : true
}

const io = socketio(server, corsOptions);
app.use(cors());
app.use(router);


io.on('connect', socket => {
    console.log('새로운 connection이 발생했습니다.');
    socket.on('join', ({name, room}, callback) => {
        const { error, user } = addUser({id : socket.id, name, room});
        if (error) callback({error : '에러가 발생했어요'});

        socket.emit('message', {
            user : 'admin',
            text : `${user.name}, ${user.room}에 오신것을 환영합니다.`
        })
        socket.broadcast.to(user.room).emit('message', {
            user : 'admin',
            text : `${user.name}님이 가입하셨습니다.`
        })
        io.to(user.room).emit('roomData', {
            room : user.room,
            users : getUsersInRoom(user.room)
        })
        socket.join(user.room);

        callback();
    });
    socket.on('disconnect', () => {
        console.log('유저가 떠났어요.');
    })
})
server.listen(PORT, () => console.log(`서버가 ${PORT}에서 시작되었어요.`))
