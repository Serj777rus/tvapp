<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div>
        <form @submit.prevent="getData">
            <input v-model="form.link" required name="link" type="text">
            <button type="submit">Получить</button>
        </form>
        <div>{{ text }}</div>
    </div>
</template>

<script>
    import axios from 'axios';
    export default {
        data() {
            return {
                form: {
                    link: ''
                },
                text: ''
            }
        },
        methods: {
            async getData() {
            const url = encodeURIComponent(this.form.link)
            const response = await axios.get(`http://localhost:3000/proxy?url=${url}`)
            // console.log(response.data);
            this.text = response.data
            console.log(response.data)
        }
        }
    }
</script>

<style lang="scss" scoped>

</style>