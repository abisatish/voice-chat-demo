const express = require('express')
const app = express();

// server to be used with socket.io
const server = require('http').Server(app)

// io knows what server we're listening to
/*
- Server is only necessary to find the different peers
- Actual connections are peer connections not connected to localhost
*/
const io = require('socket.io')(server)
const { v4 : uuidV4 } = require('uuid')

// says to use ejs as the templating enginer that allows you
// to create HTML pages dynamically with javascript inside them
app.set('view engine', 'ejs')

// This line serves static files (e.g., CSS, images, 
//JavaScript) from a folder named public.
app.use(express.static('public'))

app.get('/', (req, res) => {
    // get a random 'room' using this function uuidV4 and redirect us
    // using the get('/:room')
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    // this gets the room parameter from the path and 
    // renders it into the room.ejs, the room 
    res.render('room', { roomId: req.params.room })
})

/*
1. socket.on() – Listening for Events
Listens for an event and executes a callback function when that event occurs.

Syntax:

socket.on('eventName', (data) => {
  console.log('Received:', data);
});

2. socket.emit() – Sending Events
Sends an event with optional data to the server or another client.
Think of it like ringing the doorbell: You initiate the signal.

Syntax:

socket.emit('eventName', { message: 'Hello!' });
*/


// this will be run anytime someone connects to our webpage
io.on('connection', socket => {
    // as soon as everything is setup and we have a room/user
    // call the join-room event, which will call all the code below
    socket.on('join-room', (roomId, userId) => {
        console.log(roomId, userId)
        // when someone logs on, they join the room,
        // to the rest of the ppl in the room, they do
        // 'user-connected' socket function
        socket.join(roomId)

        socket.to(roomId).broadcast.emit('user-connected', userId)

        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })
})

server.listen(3000)

