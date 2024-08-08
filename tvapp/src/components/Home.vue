<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div>
        <form @submit.prevent="postLink">
            <input v-model="form.link" required name="link" type="text">
            <button type="submit">Получить</button>
        </form>
        <!-- <form @submit.prevent="getRudata">
            <input v-model="form.rulink" required name="link" type="text">
            <button type="submit">Получить</button>
        </form> -->
        <div>{{ text }}</div>
    </div>
</template>

<script>
    import axios from 'axios';
    export default {
        data() {
            return {
                form: {
                    link: '',
                    // rulink: ''
                },
                text: '',
                arrL: []
            }
        },
        methods: {
            async postLink() {
                const response = await axios.post(`http://localhost:3000/getdata`, this.form);
                console.log(response.data);
                this.arrL.push(response.data);
                console.log(this.arrL)
            },
            async getData() {
                const url = encodeURIComponent(this.form.link)
                const response = await axios.get(`http://localhost:3000/proxy?url=${url}`)
                // console.log(response.data);
                // response.data.data.title = decodeURIComponent(response.data.data.title)
                // this.text = response.data
                console.log(response.data)
            },
            async getRudata() {
                const url = this.form.link;
                const response = await axios.get(`http://localhost:3000/rutube?url=${url}`);
                console.log(response);
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>