<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div v-if="loading && !isToken" class="loader_main"><span class="loader"></span></div>
    <div class="main_page_div" v-else>
        <div class="main_page">
            <div class="header">
                <p>Привет {{ userName }}</p>
                <button @click="logOut">Выйти</button>
            </div>
            <PopularVideo :videos="myvideos"></PopularVideo>
            <div class="form">
                <p>Добавить новое видео из Vk Video и RuTube</p>
                <div class="form_div">
                    <form @submit.prevent="postLink">
                        <input type="text" required v-model="form.link" placeholder="Вставьте ссылку">
                        <button type="submit">Получить</button>
                    </form>
                    <div class="video_block">
                        <div aria-label="Orange and tan hamster running in a metal wheel" role="img" class="wheel-and-hamster" v-show="hamsterloader">
                            <div class="wheel"></div>
                            <div class="hamster">
                                <div class="hamster__body">
                                    <div class="hamster__head">
                                        <div class="hamster__ear"></div>
                                        <div class="hamster__eye"></div>
                                        <div class="hamster__nose"></div>
                                    </div>
                                    <div class="hamster__limb hamster__limb--fr"></div>
                                    <div class="hamster__limb hamster__limb--fl"></div>
                                    <div class="hamster__limb hamster__limb--br"></div>
                                    <div class="hamster__limb hamster__limb--bl"></div>
                                    <div class="hamster__tail"></div>
                                </div>
                            </div>
                            <div class="spoke"></div>
                        </div>
                        <div class="poster" v-show="!hamsterloader">
                            <img :src="dataOfVideo.thumbnail">
                            <p>{{ dataOfVideo.title }}</p>
                        </div>
                        <div class="video_butons" v-show="!hamsterloader">
                            <button class="button" v-for="btn in arrL" :key="btn.link" @click="inputSendingData(btn.link || btn.url)">
                                <div class="svg-wrapper-1">
                                    <div class="svg-wrapper">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        width="30"
                                        height="30"
                                        class="icon"
                                    >
                                        <path
                                        d="M22,15.04C22,17.23 20.24,19 18.07,19H5.93C3.76,19 2,17.23 2,15.04C2,13.07 3.43,11.44 5.31,11.14C5.28,11 5.27,10.86 5.27,10.71C5.27,9.33 6.38,8.2 7.76,8.2C8.37,8.2 8.94,8.43 9.37,8.8C10.14,7.05 11.13,5.44 13.91,5.44C17.28,5.44 18.87,8.06 18.87,10.83C18.87,10.94 18.87,11.06 18.86,11.17C20.65,11.54 22,13.13 22,15.04Z"
                                        ></path>
                                    </svg>
                                    </div>
                                </div>
                                <span>{{ btn.format_id || btn.resolution }}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="my_videos">
                <p>Мои видео</p>
                <div class="my_bideos_div">
                    <div class="video" v-for="video in myvideos" :key="video.id">
                        <img :src="video.thumb">
                        <p>{{ video.title }}</p>
                        <button @click="deleteVideo(video.id)">Удалить</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- <div class="auth_block" v-else>
        <p>Если Вы еще не зарегитсрировались или не авторизовались, то перейдите на стрицу авторизации</p>
        <button @click="this.$router.push('/auth')">Перейти</button>
        <p>Если Вы аторизованы, но видите это, то просто перезагрузите страницу</p>
    </div> -->
    <NavBar></NavBar>
</template>

<script>
    import axios from 'axios';
    import { jwtDecode } from 'jwt-decode';
    import PopularVideo from './other_components/PopularVideo.vue';
    import NavBar from './other_components/NavBar.vue';
    export default {
        components: {
            PopularVideo,
            NavBar
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
                myvideos: [],
                hamsterloader: false,
                nodesrv: process.env.VUE_APP_NODE_APP
            }
        },
        methods: {
            async postLink() {
                this.arrL = [];
                this.dataOfVideo = {};
                this.hamsterloader = true;
                const response = await axios.post(`${this.nodesrv}/getdata`, this.form);
                // console.log(response.data);
                if (response.data.thumb) {
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
                    this.hamsterloader = false;
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
                this.hamsterloader = false
                }
                console.log(this.arrL);
                console.log(this.dataOfVideo);
            },
            async getIsAuth() {
                const token = localStorage.getItem('jwt');
                if (!token) {
                    this.$router.push('auth')
                } else {
                    try {
                    const response = await axios.get(`${this.nodesrv}/isAuth`, { headers: { 'Authorization': `Bearer ${token}` } });
                    if (response.status == 200) {
                        this.userName = jwtDecode(token).name;
                        console.log(response.data.datas);
                        this.myvideos = response.data.datas;
                        this.isToken = true;
                    }
                    } catch(error) {
                        console.log(error);
                    } finally {
                      this.loading = false
                    }
                }
            },
            async logOut() {
                const token = localStorage.getItem('jwt');
                const response = await axios.get(`${this.nodesrv}/logout`, {headers: {'Authorization': `Bearer ${token}`}});
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
                const response = await axios.post(`${this.nodesrv}/savevideo`, this.sendingData, {headers: {'Authorization': `Berear ${token}`}});
                if (response.status == 200) {
                    console.log('Видео успешно добавлено в плейлист');
                    this.dataOfVideo = {};
                    this.arrL = [];
                    this.sendingData = {};
                    this.myvideos = [];
                    this.myvideos = response.data.datas
                    // await this.getDataAfterAdd();
                }
            },
            async deleteVideo(id) {
                const token = localStorage.getItem('jwt');
                    try {
                        const response = await axios.post(`${this.nodesrv}/deleteItem`, {id: id}, {headers: {'Authorization': `Berear ${token}`}});
                        if (response.status == 200) {
                            console.log('Видео удалено из базы');
                            this.myvideos = [];
                            this.myvideos = response.data.datas
                        }
                    } catch(error) {
                        console.log(error);
                    }
            },
            // async getDataAfterAdd() {
            //     const token = localStorage.getItem('jwt');
            //     try {
            //         const response = await axios.get(`${this.nodesrv}/updata`, {headers: {'Authorization': `Berear ${token}`}});
            //         this.myvideos = [];
            //         this.myvideos = response.data.datas
            //     } catch(error) {
            //         console.log(error)
            //     }
            // }
        },
        async mounted() {
          try {
              await this.getIsAuth(); // Ждём завершения загрузки данных
              if (this.isToken == true && this.myvideos.length !== 0) {
                  this.loading = false; // Скрываем загрузку только после того, как данные получены
                  console.log('Статус загрузки в mounted', this.loading)
              }
          } catch (error) {
              console.log(error);
              this.loading = false; // Скрываем загрузку даже в случае ошибки
          }
        },
        watch:{
          myvideos(newValue) {
            if (newValue.length !== 0) {
              this.loading = false
            }
          },
          isToken(newValue) {
            if (newValue === true) {
              this.loading = false
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
.main_page_div {
    width: 100%;
    padding: 40px 10px;
    padding-bottom: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
}
.main_page {
    width: 100%;
    display: flex;
    flex-direction: column;
}
.header {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}
.header p {
    font-size: 16px;
    font-weight: 300;
}
.header button {
    padding: 8px 12px;
    border-radius: 32px;
    box-sizing: border-box;
    border: none;
    font-size: 12px;
    line-height: 100%;
    color: #fff;
    background: red;
}
.form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 32px;
}
.form_div {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 32px;
}
.form p {
    font-size: 20px;
    font-weight: 700;
    line-height: 100%;
}
.form_div form {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 12px;
}
.form_div form input {
    width: 100%;
    padding: 16px 12px;
    box-sizing: border-box;
    background-color: #494949;
    border: none;
    border-radius: 8px;
    color: rgb(255, 255, 255, .6);
}
.form_div form button {
    width: 100%;
    padding: 20px 32px;
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(270deg, rgba(1, 133, 255, 1),rgba(80, 170, 255, 1)) no-repeat;
    border: none;
    border-radius: 32px;
    line-height: 100%;
    margin-bottom: 16px;
}
.video_block {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px
}
.poster {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px
}
.poster img {
    width: 100%;
    border-radius: 16px;
    object-fit: cover;
}
.poster p {
    font-size:  16px;
    line-height: 100%;
}
.video_butons {
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12px;
}
.button {
  font-family: inherit;
  font-size: 12px;
  background: #212121;
  color: white;
  fill: rgb(155, 153, 153);
  padding: 0.7em 1em;
  padding-left: 0.9em;
  display: flex;
  align-items: center;
  cursor: pointer;
  border: none;
  border-radius: 15px;
  font-weight: 500;
}

.button span {
  display: block;
  margin-left: 0.3em;
  transition: all 0.3s ease-in-out;
}

.button svg {
  display: block;
  transform-origin: center center;
  transition: transform 0.3s ease-in-out;
}

.button:hover {
  background: #000;
}

.button:hover .svg-wrapper {
  transform: scale(1.25);
  transition: 0.5s linear;
}

.button:hover svg {
  transform: translateX(1.2em) scale(1.1);
  fill: #fff;
}

.button:hover span {
  opacity: 0;
  transition: 0.5s linear;
}

.button:active {
  transform: scale(0.95);
}
.my_videos {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 32px
}
.my_videos p {
    font-size: 24px;
    font-weight: 500;
    line-height: 100%;
}
.my_bideos_div {
    display: flex;
    flex-direction: row;
    overflow: scroll;
    gap: 12px;
    box-sizing: border-box;
}
.video {
    display: flex;
    max-width: 112px;
    flex-direction: column;
    justify-content: space-between;
    gap: 8px;
    align-items: start;
}
.video img {
    height: 200px;
    aspect-ratio: 9/16;
    object-fit: cover;
    border-radius: 16px;
}
.video p {
    font-size: 8px;
    line-height: 100%;
}
.video button {
    padding: 4px 16px;
    line-height: 100%;
    color: #fff;
    background: red;
    border: none;
    border-radius: 4px;
    font-size: 12px;
}

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

/* loader hamster */
.wheel-and-hamster {
  --dur: 1s;
  position: relative;
  width: 160px;
  height: 160px;
  font-size: 14px;
  align-self: center;
  justify-self: center;
}

.wheel,
.hamster,
.hamster div,
.spoke {
  position: absolute;
}

.wheel,
.spoke {
  border-radius: 50%;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.wheel {
  background: radial-gradient(100% 100% at center,hsla(0,0%,60%,0) 47.8%,hsl(0,0%,60%) 48%);
  z-index: 2;
}

.hamster {
  animation: hamster var(--dur) ease-in-out infinite;
  top: 50%;
  left: calc(50% - 3.5em);
  width: 7em;
  height: 3.75em;
  transform: rotate(4deg) translate(-0.8em,1.85em);
  transform-origin: 50% 0;
  z-index: 1;
}

.hamster__head {
  animation: hamsterHead var(--dur) ease-in-out infinite;
  background: hsl(30,90%,55%);
  border-radius: 70% 30% 0 100% / 40% 25% 25% 60%;
  box-shadow: 0 -0.25em 0 hsl(30,90%,80%) inset,
		0.75em -1.55em 0 hsl(30,90%,90%) inset;
  top: 0;
  left: -2em;
  width: 2.75em;
  height: 2.5em;
  transform-origin: 100% 50%;
}

.hamster__ear {
  animation: hamsterEar var(--dur) ease-in-out infinite;
  background: hsl(0,90%,85%);
  border-radius: 50%;
  box-shadow: -0.25em 0 hsl(30,90%,55%) inset;
  top: -0.25em;
  right: -0.25em;
  width: 0.75em;
  height: 0.75em;
  transform-origin: 50% 75%;
}

.hamster__eye {
  animation: hamsterEye var(--dur) linear infinite;
  background-color: hsl(0,0%,0%);
  border-radius: 50%;
  top: 0.375em;
  left: 1.25em;
  width: 0.5em;
  height: 0.5em;
}

.hamster__nose {
  background: hsl(0,90%,75%);
  border-radius: 35% 65% 85% 15% / 70% 50% 50% 30%;
  top: 0.75em;
  left: 0;
  width: 0.2em;
  height: 0.25em;
}

.hamster__body {
  animation: hamsterBody var(--dur) ease-in-out infinite;
  background: hsl(30,90%,90%);
  border-radius: 50% 30% 50% 30% / 15% 60% 40% 40%;
  box-shadow: 0.1em 0.75em 0 hsl(30,90%,55%) inset,
		0.15em -0.5em 0 hsl(30,90%,80%) inset;
  top: 0.25em;
  left: 2em;
  width: 4.5em;
  height: 3em;
  transform-origin: 17% 50%;
  transform-style: preserve-3d;
}

.hamster__limb--fr,
.hamster__limb--fl {
  clip-path: polygon(0 0,100% 0,70% 80%,60% 100%,0% 100%,40% 80%);
  top: 2em;
  left: 0.5em;
  width: 1em;
  height: 1.5em;
  transform-origin: 50% 0;
}

.hamster__limb--fr {
  animation: hamsterFRLimb var(--dur) linear infinite;
  background: linear-gradient(hsl(30,90%,80%) 80%,hsl(0,90%,75%) 80%);
  transform: rotate(15deg) translateZ(-1px);
}

.hamster__limb--fl {
  animation: hamsterFLLimb var(--dur) linear infinite;
  background: linear-gradient(hsl(30,90%,90%) 80%,hsl(0,90%,85%) 80%);
  transform: rotate(15deg);
}

.hamster__limb--br,
.hamster__limb--bl {
  border-radius: 0.75em 0.75em 0 0;
  clip-path: polygon(0 0,100% 0,100% 30%,70% 90%,70% 100%,30% 100%,40% 90%,0% 30%);
  top: 1em;
  left: 2.8em;
  width: 1.5em;
  height: 2.5em;
  transform-origin: 50% 30%;
}

.hamster__limb--br {
  animation: hamsterBRLimb var(--dur) linear infinite;
  background: linear-gradient(hsl(30,90%,80%) 90%,hsl(0,90%,75%) 90%);
  transform: rotate(-25deg) translateZ(-1px);
}

.hamster__limb--bl {
  animation: hamsterBLLimb var(--dur) linear infinite;
  background: linear-gradient(hsl(30,90%,90%) 90%,hsl(0,90%,85%) 90%);
  transform: rotate(-25deg);
}

.hamster__tail {
  animation: hamsterTail var(--dur) linear infinite;
  background: hsl(0,90%,85%);
  border-radius: 0.25em 50% 50% 0.25em;
  box-shadow: 0 -0.2em 0 hsl(0,90%,75%) inset;
  top: 1.5em;
  right: -0.5em;
  width: 1em;
  height: 0.5em;
  transform: rotate(30deg) translateZ(-1px);
  transform-origin: 0.25em 0.25em;
}

.spoke {
  animation: spoke var(--dur) linear infinite;
  background: radial-gradient(100% 100% at center,hsl(0,0%,60%) 4.8%,hsla(0,0%,60%,0) 5%),
		linear-gradient(hsla(0,0%,55%,0) 46.9%,hsl(0,0%,65%) 47% 52.9%,hsla(0,0%,65%,0) 53%) 50% 50% / 99% 99% no-repeat;
}

/* Animations */
@keyframes hamster {
  from, to {
    transform: rotate(4deg) translate(-0.8em,1.85em);
  }

  50% {
    transform: rotate(0) translate(-0.8em,1.85em);
  }
}

@keyframes hamsterHead {
  from, 25%, 50%, 75%, to {
    transform: rotate(0);
  }

  12.5%, 37.5%, 62.5%, 87.5% {
    transform: rotate(8deg);
  }
}

@keyframes hamsterEye {
  from, 90%, to {
    transform: scaleY(1);
  }

  95% {
    transform: scaleY(0);
  }
}

@keyframes hamsterEar {
  from, 25%, 50%, 75%, to {
    transform: rotate(0);
  }

  12.5%, 37.5%, 62.5%, 87.5% {
    transform: rotate(12deg);
  }
}

@keyframes hamsterBody {
  from, 25%, 50%, 75%, to {
    transform: rotate(0);
  }

  12.5%, 37.5%, 62.5%, 87.5% {
    transform: rotate(-2deg);
  }
}

@keyframes hamsterFRLimb {
  from, 25%, 50%, 75%, to {
    transform: rotate(50deg) translateZ(-1px);
  }

  12.5%, 37.5%, 62.5%, 87.5% {
    transform: rotate(-30deg) translateZ(-1px);
  }
}

@keyframes hamsterFLLimb {
  from, 25%, 50%, 75%, to {
    transform: rotate(-30deg);
  }

  12.5%, 37.5%, 62.5%, 87.5% {
    transform: rotate(50deg);
  }
}

@keyframes hamsterBRLimb {
  from, 25%, 50%, 75%, to {
    transform: rotate(-60deg) translateZ(-1px);
  }

  12.5%, 37.5%, 62.5%, 87.5% {
    transform: rotate(20deg) translateZ(-1px);
  }
}

@keyframes hamsterBLLimb {
  from, 25%, 50%, 75%, to {
    transform: rotate(20deg);
  }

  12.5%, 37.5%, 62.5%, 87.5% {
    transform: rotate(-60deg);
  }
}

@keyframes hamsterTail {
  from, 25%, 50%, 75%, to {
    transform: rotate(30deg) translateZ(-1px);
  }

  12.5%, 37.5%, 62.5%, 87.5% {
    transform: rotate(10deg) translateZ(-1px);
  }
}

@keyframes spoke {
  from {
    transform: rotate(0);
  }

  to {
    transform: rotate(-1turn);
  }
}
</style>