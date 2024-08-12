<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div v-if="loading" class="loader_main"><span class="loader"></span></div>
    <div class="main_page" v-else-if="isToken">
        <div class="header">
            <p>Привет {{ userName }}</p>
            <span>My media library<br>сервис удобного хранения медиатеки Rutube и Vk Video</span>
            <button @click="logOut">Выйти</button>
        </div>
        <PopularVideo :videos="myvideos"></PopularVideo>
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
        <p>Если Вы еще не зарегитсрировались или не авторизовались, то перейдите на стрицу авторизации</p>
        <button @click="this.$router.push('/auth')">Перейти</button>
        <p>Если Вы аторизованы, но видите это, то просто перезагрузите страницу</p>
    </div>
</template>

<script>
    import axios from 'axios';
    import { jwtDecode } from 'jwt-decode';
    import PopularVideo from './other_components/PopularVideo.vue';
    export default {
        components: {
            PopularVideo
        },
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
/* loader */
.loader_main {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #333;
}
.loader {
  width: 32px;
  height: 90px;
  display: block;
  margin: 20px auto;
  position: relative;
  border-radius: 50% 50% 0 0;
  border-bottom: 10px solid #337AB7;
  background-color: #6ebeff;
  background-image: radial-gradient(ellipse at center, #6ebeff 34%, #337AB7 35%, #337AB7 54%, #6ebeff 55%), linear-gradient(#337AB7 10px, transparent 0);
  background-size: 28px 28px;
  background-position: center 20px , center 2px;
  background-repeat: no-repeat;
  box-sizing: border-box;
  animation: animloaderBack 1s linear infinite alternate;
}
.loader::before {
  content: '';  
  box-sizing: border-box;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 64px;
  height: 44px;
  border-radius: 50%;
  box-shadow: 0px 15px #337AB7 inset;
  top: 67px;
}
.loader::after {
  content: '';  
  position: absolute;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 34px;
  height: 34px;
  top: 112%;
  background: radial-gradient(ellipse at center, #ffdf00 8%, rgba(249, 62, 0, 0.6) 24%, rgba(0, 0, 0, 0) 100%);
  border-radius: 50% 50% 0;
  background-repeat: no-repeat;
  background-position: -44px -44px;
  background-size: 100px 100px;
  box-shadow: 4px 4px 12px 0px rgba(51, 122, 183, 0.5);
  box-sizing: border-box;
  animation: animloader 1s linear infinite alternate;
}

@keyframes animloaderBack {
  0%, 30%, 70% {
    transform: translateY(0px);
  }
  20%, 40%, 100% {
    transform: translateY(-5px);
  }
}

@keyframes animloader {
  0% {
    box-shadow: 4px 4px 12px 2px rgba(51, 122, 183, 0.75);
    width: 34px;
    height: 34px;
    background-position: -44px -44px;
    background-size: 100px 100px;
  }
  100% {
    box-shadow: 2px 2px 8px 0px rgba(51, 122, 183, 0.5);
    width: 30px;
    height: 28px;
    background-position: -36px -36px;
    background-size: 80px 80px;
  }
}
/* Основная страница */


/* Блок ошибки авторизации */
.auth_block {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}
.auth_block p {
    width: 600px;
    text-align: center;
    font-size: 16px;
}
.auth_block button {
    padding: 12px 32px;
    font-size: 12px;
    color: #fff;
    background: green;
    border: none;
    border-radius: 32px;
}
</style>