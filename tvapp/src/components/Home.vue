<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div v-if="loading">Loading...</div>
    <div class="main_page" v-else-if="isToken">
        <p>привет {{ userName }}</p>
        <button @click="logOut">Выйти</button>
        <div class="form">
            <form @submit.prevent="postLink">
                <input type="text" required v-model="form.link">
                <button type="submit">Получить</button>
            </form>
        </div>
        <div class="video_block">
            <div class="poster">
                <img :src="dataOfVideo.thumb">
                <p>{{ dataOfVideo.title }}</p>
            </div>
            <div class="video_butons">
                <button v-for="btn in arrL" :key="btn.link" @click="inputSendingData(btn.link || btn.url)">{{ btn.format || btn.resolution }}</button>
            </div>
        </div>
        <div class="my_videos">
            <div class="my_bideos_div">
                <div class="video" v-for="video in myvideos" :key="video.id">
                    <img :src="video.thumb">
                    <p>{{ video.title }}</p>
                    <button @click="deleteVideo(video.id)">Удалить</button>
                </div>
            </div>
        </div>
    </div>
    <div class="auth_block" v-else>
        Нужно авторизоваться
    </div>
</template>

<script>
    import axios from 'axios';
    import { jwtDecode } from 'jwt-decode';
    export default {
        data() {
            return {
                form: {
                    link: '',
                },
                text: '',
                arrL: [],
                dataOfVideo: {},
                userName: '',
                isToken: false,
                loading: true,
                sendingData: {},
                myvideos: []
            }
        },
        methods: {
            async postLink() {
                this.arrL = [];
                this.dataOfVideo = {};
                const response = await axios.post(`http://localhost:3000/getdata`, this.form);
                // console.log(response.data);
                if (response.data.title) {
                    // console.log(response.data.title);
                    this.dataOfVideo = {
                        title: response.data.title,
                        thumb: response.data.thumb
                    }
                    let strings = response.data.links.split('\n');
                    const filteredLines = strings.filter(strings => strings !== "#EXTM3U");
                    const objects = [];
                    let currentObject = null;

                    const infoRegex = /#EXT-X-STREAM-INF:PROGRAM-ID=(\d+), BANDWIDTH=(\d+), FRAME-RATE=([\d.]+), CODECS="([^"]+)", RESOLUTION=([^,]+)/;
                    // console.log(strings);
                    filteredLines.forEach(line => {
                        if (infoRegex.test(line)) {
                            const matches = line.match(infoRegex);
                            const [, programId, bandwidth, frameRate, codecs, resolution] = matches;
                            currentObject = {
                                programId,
                                bandwidth,
                                frameRate,
                                codecs,
                                resolution,
                                link: null
                            };
                            objects.push(currentObject);
                        } else if (line.startsWith('http')) {
                            if (currentObject) {
                                currentObject.link = line;
                                currentObject = null; // Сброс текущего объекта
                            }
                        }
                    })
                    this.arrL = objects;
                    // console.log(this.arrL)

                } else {
                    Object.entries(response.data).forEach(([key, value]) => {
                    if (key.startsWith('dl')) {
                        if (value.format == '') {
                            console.log('empty')
                        } else {
                            this.arrL.push(value)
                        }
                    }
                    if (key.startsWith('data')) {
                        this.dataOfVideo = value;
                    }
                });
                }
                console.log(this.arrL);
                console.log(this.dataOfVideo);
            },
            async getIsAuth() {
                const token = localStorage.getItem('jwt');
                console.log(token)
                if (!token) {
                    this.$router.push('auth')
                } else {
                    try {
                    const response = await axios.get('http://localhost:3000/isAuth', { headers: { 'Authorization': `Bearer ${token}` } });
                    if (response.status == 200) {
                        this.isToken = true;
                        this.userName = jwtDecode(token).name;
                        console.log(response.data.datas);
                        this.myvideos = response.data.datas
                    }
                    } catch(error) {
                        console.log(error);
                    }
                }
            },
            async logOut() {
                const token = localStorage.getItem('jwt');
                const response = await axios.get('http://localhost:3000/logout', {headers: {'Authorization': `Bearer ${token}`}});
                if (response.status == 200) {
                    localStorage.removeItem('jwt');
                    this.isToken = false;
                    this.$router.push('auth');
                } else {
                    console.log('Ошибка, попробуйте еще раз');
                }
            },
            async inputSendingData(link) {
                this.sendingData.link = link
                this.sendingData.thumb = this.dataOfVideo.thumb
                this.sendingData.title = this.dataOfVideo.title
                console.log(this.sendingData);
                const token = localStorage.getItem('jwt')
                const response = await axios.post('http://localhost:3000/savevideo', this.sendingData, {headers: {'Authorization': `Berear ${token}`}});
                if (response.status == 200) {
                    console.log('Видео успешно добавлено в плейлист')
                }
            },
            async deleteVideo(id) {
                const token = localStorage.getItem('jwt');
                console.log(id);
                    try {
                        const response = await axios.post('http://localhost:3000/deleteItem', {id: id}, {headers: {'Authorization': `Berear ${token}`}});
                        if (response.status == 200) {
                            console.log('Видео удалено из базы');
                            this.myvideos = [];
                            this.myvideos = response.data.datas
                        }
                    } catch(error) {
                        console.log(error);
                    }
            }
        },
        async mounted() {
            await this.getIsAuth();
        },
        watch: {
            isToken(newValue) {
            if (newValue) {
                this.loading = false;
            }
            }
        } 
    }
</script>

<style scoped>
 .my_videos {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 40px;
}
.my_bideos_div {
    width: 1200px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 24px;
}
.video {
    flex-direction: column;
    gap: 8px;
    display: flex;
    max-width: 300px;
    align-items: start;
}
.video img {
    width: 280px;
    object-fit: cover;
    border-radius: 16px;
    box-shadow: 0px 0px 12px 2px rgba(0, 0, 0, .3);
}
.video p {
    font-size: 16px;
    line-height: 100%;
}
.video button {
    padding: 4px 12px;
    border: none;
    border-radius: 4px;
    color: #fff;
    background: red;
    font-size: 12px;
    line-height: 100%;
}
</style>