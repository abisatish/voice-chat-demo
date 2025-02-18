// connects us to the localhost3000 socket server directly
// (http://localhost:3000/socket.io/)
const socket = io('/')

// finds the <div id="video-grid"> element in your html
const videoGrid = document.getElementById('video-grid')

// connects to Peer.js server running on port 3001
/* 
PEER ID:
A unique identifier assigned to you automatically.

const myPeer = new Peer();
console.log(myPeer.id); // e.g., "d9f0b92a"

PEER CALL:
Sends your video/audio stream to another peer (by their ID)

const call = myPeer.call(otherUserId, myStream);

PEER ON CALL:
Listens for incoming calls from another user.

myPeer.on('call', (call) => {
  call.answer(myStream);
  call.on('stream', (remoteStream) => {
    addVideoStream(remoteVideo, remoteStream);
  });
});

PEER ON OPEN:
Triggered when the connection to the Peer.js server is established.

myPeer.on('open', id => {
  console.log('My Peer ID:', id);
  socket.emit('join-room', ROOM_ID, id);
});

PEER DISCONNECT:
Terminates the connection with the Peer.js server.
myPeer.disconnect();
*/
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
  })

// creates a video element to show your own video
const myVideo = document.createElement('video')
// mutes the video for ourselves but not for others
myVideo.muted = true

const peers = {}

// asks for camera and mic access and displats your video
// with addVideoStream()
navigator.mediaDevices.getUserMedia({
    video : true,
    audio: true
}).then(stream => {
    // passes us a video and audio stream
    addVideoStream(myVideo, stream)

    myPeer.on('call', call => {
        // answer the call and send them our current screen
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        // a new user has joined our stream, so send video footage over
        connectToNewUser(userId, stream)
    })
})

socket.on('user-disconnected', userId => {
    if(peers[userId]) peers[userId].close()
})

// when Peer.js connects (ie. establishes a peer.id()
// it triggers on('open') and gives a unique id
myPeer.on('open', id => {
    // after we have a peer id, we send out event to join the
    // room
    socket.emit('join-room', ROOM_ID, id)
})


function connectToNewUser(userId, stream) {
    // call the new User and send them our video stream
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')

    // when they send us back their video, call on stream is
    // triggered, and we get back their video stream, and add it
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    // if someone leaves, we want to remove their video
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video, stream) {
    // shows camera stream in video element created
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        // starts playing the video
        video.play()
    })
    // add the video to the grid.
    videoGrid.append(video)
}