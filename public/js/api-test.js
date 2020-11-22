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
        username: 'Jack',
        nickname: 'Hello Worls',
        password: 'admin'
    }
}, {
    method: 'post',
    url: 'login',
    data: {
        username: 'Jack',
        password: 'admin'
    }
}, {
    method: 'post',
    url: 'chatroom/create',
    data: {
        user_id: 11,
        room_name: 'Hello Room'
    }
}, {
    method: 'post',
    url: 'chatroom/search',
    data: {
        user_id: 11,
        keyword: 'Es'
    }
}, {
    method: 'post',
    url: 'chatroom/join',
    data: {
        user_id: 11,
        room_id: '5'
    }
}, {
    method: 'post',
    url: 'chatroom/join',
    data: {
        user_id: 11,
        room_id: 6
    }
}, {
    method: 'post',
    url: 'chatroom/leave',
    data: {
        user_id: 11,
        room_id: 5
    }
}, {
    user_id: 11,
    method: 'get',
    url: 'logout'
// }, {
//     method: 'post',
//     url: 'login',
//     data: {
//         username: 'test',
//         password: 'test'
//     }
// }, {
//     method: 'post',
//     url: 'chatroom/get',
//     data: {
//         room_id: 6
//     }
// }, {
//     method: 'post',
//     url: 'homepage',
// },{
//     method: 'get',
//     url: 'logout',
}];

async function runAPITests() {
    for (let i = 0; i < cases.length; i++) {
        console.log(`--------------- Test ${i+1} --------------`);
        console.log(`${cases[i].method} /${cases[i].url}`)
        await test(cases[i]);
        console.log('\n');
    }
}
