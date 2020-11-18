async function test(params) {
    params.url = `http://localhost:3000/${params.url}`;
    const result = await axios(params);
    console.log(`status: ${result.status}`);
    if (result.data) console.log(`data: ${JSON.stringify(result.data)}`);
}

const cases = [{
    method: 'post', 
    url: 'signup',
    data: {
        username: 'yankai',
        nickname: 'Kai Yan',
        password: 'admin'
    }
}, {
    method: 'post',
    url: 'login',
    data: {
        username: 'yankai',
        password: 'admin'
    }
}, {
    method: 'post',
    url: 'chatroom/create',
    data: {
        room_name: 'My Room'
    }
}, {
    method: 'post',
    url: 'chatroom/search',
    data: {
        keyword: 'Es'
    }
}, {
    method: 'post',
    url: 'chatroom/join',
    data: {
        room_id: '5'
    }
}, {
    method: 'post',
    url: 'chatroom/join',
    data: {
        room_id: 6
    }
}, {
    method: 'post',
    url: 'chatroom/leave',
    data: {
        room_id: 5
    }
}, {
    method: 'get',
    url: 'logout'
}, {
    method: 'post',
    url: 'login',
    data: {
        username: 'test',
        password: 'test'
    }
}, {
    method: 'post',
    url: 'chatroom/get',
    data: {
        room_id: 6
    }
}, {
    method: 'get',
    url: 'logout',
}];

async function runTests() {
    for (let i = 0; i < cases.length; i++) {
        console.log(`--------------- Test ${i+1} --------------`);
        console.log(`${cases[i].method} /${cases[i].url}`)
        await test(cases[i]);
        console.log('\n');
    }
}

// runTests();