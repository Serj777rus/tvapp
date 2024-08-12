<template>
    <div class="populare_video_div">
        <p>Популярные видео</p>
        <div class="poplare_video_block" v-if="videos.length > 0">
            <div class="video" v-for="video in videos" :key="video.id">
                <img :src="video.thumb">
                <p>{{ video.title }}</p>
                <button>Добавить к себе</button>
            </div>
        </div>
        <div class="error_video_block">
            <p>Этот раздел находится в разработке и скором времени будет доступен</p>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            videos: {
                type: Array,
                required: false
            }
        },
       data() {
        return {
            
        }
       } 
    }
</script>

<style scoped>
    .populare_video_div {
        width: 1200px;
        display: flex;
        flex-direction: column;
        gap: 16px
    }
    .poplare_video_block {
        width: 100%;
        display: flex;
        flex-direction: row;
        gap:16px;
        overflow-x: scroll;
    }
    .video {
        width: 240px;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    .video img {
        width: 100%;
        object-fit: cover;
        border-radius: 16px;
        box-shadow: 0px 0px 12px 2px rgba(0, 0, 0, .3);
    }
    .video p {
        font-size: 12px;
    }
    .video button {
        padding: 4px 16px;
        color: #fff;
        background: green;
        border: none;
        border-radius: 4px;
    }
    .error_video_block {
        width: 100%;
        align-self: center;
        justify-self: center;
        text-align: center;
        font-size: 20px;
    }
</style>