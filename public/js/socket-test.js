function socketTest() {
    let socket = io();

    let token = 'a0dd71887f3c140e69fa4dd1c6d5feb253809dcb5a4df0da2b299a4a6e4479ac';

    socket.on('connect', () => {
        socket.emit('init', token);
    });

    socket.on('err', (err) => {
        console.log(err);
    });

    setTimeout(() => {
        socket.emit('join', {
            token: token,
            room_id: '5'
        })
        socket.emit('join', {
            token: token,
            room_id: '100'
        })
    }, 5000);
}

// socketTest();