function uploadTest1(params) {
    const img = document.getElementById('image')
    fetch(img.src).then(res => res.blob()).then(async (blob) => {
        const file = new File([blob], 'dot.png', blob)
        console.log(file);

        let formdata = new FormData();
        formdata.append('username', 'uploader');
        formdata.append('nickname', 'Uploader');
        formdata.append('password', 'admin');
        formdata.append('file', file);

        const result = await axios({
            method: 'post',
            url: 'signup',
            data: formdata,
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log(result);

    })
}

function uploadTest2(params) {
    const img = document.getElementById('image')
    fetch(img.src).then(res => res.blob()).then(async (blob) => {
        const file = new File([blob], 'dot.png', blob)
        console.log(file);

        let formdata = new FormData();
        formdata.append('token', '74e0ca5d38b57ec0ff1a0ff1cb836696890616886b8bd54ef2769bfb46537fb2');
        formdata.append('room_name', 'Has Profile');
        formdata.append('file', file);

        const result = await axios({
            method: 'post',
            url: 'chatroom/create',
            data: formdata,
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log(result);

    })
}

function runUploadTest() {
    // uploadTest1();
    uploadTest2();
}