<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div class="auth">
        <div class="auth_div">
            <form @submit.prevent="regPost" :class="{active: isRegOrAuth == false}">
                <span class="h2">Регистрация</span>
                <span>Зарегистрируйтесь удобным способом</span>
                <div class="inputs">
                    <label for="name">Имя</label>
                    <input v-model="form.name" id="name" type="text" name="name" placeholder="Ваше имя" required>
                </div>
                <div class="inputs">
                    <label for="mail">Почта</label>
                    <input v-model="form.mail" id="mail" type="email" name="mail" placeholder="Ваш email" required>
                </div>
                <div class="inputs">
                    <label for="password">Придумайте пароль</label>
                    <input v-model="form.pass" id="password" type="password" name="password" required>
                </div>
                <div class="inputs">
                    <label for="pass">Повторите пароль</label>
                    <input v-model="form.confirm" id="pass" type="password" name="pass" required>
                </div>
                <div>{{ message }}</div>
                <button type="submit">Зарегистрироваться</button>
                <p @click="changeForm">Уже зарегистрированы? Авторизуйтесь</p>
            </form>
            <form @submit.prevent="authPost" :class="{active: isRegOrAuth == true}">
                <span class="h2">Авторизация</span>
                <span>Введите почту и пароль</span>
                <div class="reginputs">
                    <label for="mail">Почта</label>
                    <input v-model="authform.mail" id="mail" type="email" name="mail" placeholder="Ваш email" required>
                </div>
                <div class="reginputs">
                    <label for="password">Пароль</label>
                    <input v-model="authform.pass" id="password" type="password" name="password" required>
                </div>
                <div>{{ message }}</div>
                <button type="submit">Зарегистрироваться</button>
                <p @click="changeForm">Еще не зарегистрированы? Жми сюда</p>
            </form>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
    export default {
        data() {
            return {
                form: {
                    name: '',
                    mail: '',
                    pass: '',
                    confirm: ''
                },
                message: '',
                authform: {
                    mail: '',
                    pass: ''
                },
                isRegOrAuth: true
            }
        },
        methods: {
            async regPost() {
                try {
                    const response = await axios.post('http://localhost:3000/register', this.form);
                    if (response.status == 200) {
                        console.log('Регистрация прошла')
                        console.log(response.data.jwt);
                        localStorage.setItem('jwt', response.data.jwt);
                        this.$router.push('/');
                    } 
                } catch(error) {
                    if (error.response && error.response.status == 400) {
                        this.message = error.response.data.message
                        setTimeout(() => {
                            this.message = ''
                        }, 2000)
                        console.log(error.response)
                    }
                }
            },
            changeForm() {
                if (this.isRegOrAuth == true) {
                    this.isRegOrAuth = false;
                } else {
                    this.isRegOrAuth = true;
                }
            },
            async authPost() {
                try {
                    const response = await axios.post('http://localhost:3000/login', this.authform);
                    if (response.status == 200) {
                        localStorage.setItem('jwt', response.data.jwt);
                            this.$router.push('/')
                    }
                    if (response.status == 400) {
                        this.message = 'Такого пользователя не существует'
                    }
                } catch(error) {
                    console.log(error);
                }
            }
        }
    }
</script>

<style scoped>
    .auth {
        width: 100%;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #1f1f1f;
        color: #e0e0e0;
    }
    .auth_div {
        width: 1280px;
        display: flex;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        position: relative;
    }
    .auth_div form {
        width: 420px;
        height: auto;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 32px;
        background: #111111;
        border-radius: 32px;
        gap: 16px;
        box-shadow: 0px 0px 16px 2px rgba(101, 101, 101, 0.3);
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        opacity: 0;
        transition: 500ms all ease;
        z-index: 1;
    }
    form .h2 {
        font-size: 40px;
        font-weight: 700;
    }
    form span {
        margin-bottom: 24px;
    }
    .inputs {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    .inputs label {
        padding-left: 12px;
    }
    input {
        box-sizing: border-box;
        width: 100%;
        padding: 12px 12px;
        border: 1px solid #757575;
        background: transparent;
        border-radius: 16px;
        color: #e0e0e0;
    }
    button {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        color: #e0e0e0;
        background: green;
        cursor: pointer;
        margin-top: 20px;
    }

    /* авторизация*/
    .register_div form {
        width: 420px;
        height: auto;
        box-sizing: border-box;
        display: flex;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        opacity: 0;
        transform: scale(0);
        transition: 500ms all ease;
        flex-direction: column;
        align-items: center;
        padding: 32px;
        background: #111111;
        border-radius: 32px;
        gap: 16px;
        box-shadow: 0px 0px 16px 2px rgba(101, 101, 101, 0.3);
        z-index: 1;
    }
    .register_div form .h2 {
        font-size: 40px;
        font-weight: 700;
    }
    .register_div form span {
        margin-bottom: 24px;
    }
    .reginputs {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    .reginputs label {
        padding-left: 12px;
    }
    .reginputs input {
        box-sizing: border-box;
        width: 100%;
        padding: 12px 12px;
        border: 1px solid #757575;
        background: transparent;
        border-radius: 16px;
        color: #e0e0e0;
    }
    button {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        color: #e0e0e0;
        background: green;
        cursor: pointer;
        margin-top: 32px;
    }
    form p {
        font-size: 12px;
    }
    .active {
        opacity: 1 !important;
        transform: scale(1);
        z-index: 2 !important;
    }
</style>