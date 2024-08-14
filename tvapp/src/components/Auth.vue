<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div class="auth">
        <div class="auth_div">
            <form @submit.prevent="regPost" :class="{active: isRegOrAuth == false}">
                <img src="../assets/auth/reg.png">
                <span class="h2">Регистрация</span>
                <div class="reginputs">
                    <input v-model="form.name" type="text" name="name" placeholder="Ваше имя" required>
                    <input v-model="form.mail" @input="debounsing" type="email" name="mail" placeholder="Ваш email" required>
                    <div v-if="message">{{ message }}</div>
                    <input v-model="form.pass" @input="checkPass(form.pass)" type="password" name="password" placeholder="Придумайте пароль" required>
                    <div v-if="messagepass">{{ messagepass }}</div>
                    <input v-model="form.confirm" @input="checkConfirm(form.confirm)" id="pass" type="password" name="pass" placeholder="Повторите пароль" required>
                    <div v-if="confirmmessage">{{ confirmmessage }}</div>
                </div>
                <button type="submit">Зарегистрироваться</button>
                <p @click="changeForm">Уже зарегистрированы? Авторизуйтесь</p>
            </form>
            <form @submit.prevent="authPost" :class="{active: isRegOrAuth == true}">
                <img src="../assets/auth/reg.png">
                <span class="h2">Авторизация</span>
                <div class="reginputs">
                    <input v-model="authform.mail" id="mail" type="email" name="mail" placeholder="Email" required>
                    <input v-model="authform.pass" id="password" type="password" name="password" placeholder="Пароль" required>
                </div>
                <button type="submit">Войти</button>
                <p @click="changeForm">Еще не зарегистрированы? Жми сюда</p>
            </form>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { debounce } from 'lodash';
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
                messagepass: '',
                confirmmessage: '',
                authform: {
                    mail: '',
                    pass: ''
                },
                isRegOrAuth: true,
                nodesrv: process.env.VUE_APP_NODE_APP
            }
        },
        methods: {
            async regPost() {
                try {
                    const response = await axios.post(`${this.nodesrv}/register`, this.form);
                    if (response.status == 200) {
                        console.log('Регистрация прошла')
                        console.log(response.data.jwt);
                        localStorage.setItem('jwt', response.data.jwt);
                        setTimeout(() => {
                            this.$router.push('/');
                        }, 500);
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
                    const response = await axios.post(`${this.nodesrv}/login`, this.authform);
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
            },
            async checkEmail(value) {
                if (value.length == 0) {
                    this.message = ''
                } else {
                    try {
                    const response = await axios.post(`${this.nodesrv}/checkmail`, {email: value});
                    if (response.data.status == '200') {
                        this.message = ''
                        this.message = response.data.message
                    } else if (response.data.status == '400') {
                        this.message = ''
                        this.message = response.data.message
                    }
                } catch(error) {
                    console.log(error)
                }
                }
            },
            debounsing() {
                this.debounceCheckEmail(this.form.mail)
            },
            checkPass(value) {
                if (value.length == 0) {
                    this.messagepass = ''
                }
                else if (value.length <= 4) {
                    this.messagepass = 'Слишком короткий пароль'
                } else {
                    this.messagepass = 'Хороший пароль'
                }
            },
            checkConfirm(value) {
                if (value.length == 0) {
                    this.confirmmessage = ''
                }
                if (value !== this.form.pass) {
                    this.confirmmessage = 'Пароли не сопадают'
                } else {
                    this.confirmmessage = 'Пароли совпадают'
                }
            }
        },
        created() {
            this.debounceCheckEmail = debounce(this.checkEmail, 500)
        }
    }
</script>
<style scoped>
.auth {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 32px 10px;
    justify-content: center;
    box-sizing: border-box;
}
.auth_div {
    width: 100%;
    height: 100vh;
    display: flex;
    position: relative;
}
.active {
    opacity: 1;
    z-index: 2;
}
form {
    opacity: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: 300ms all ease;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: start;
    box-sizing: border-box;
    z-index: 1;
}
form img {
    width: 50%;
    object-fit: cover;
    margin-bottom: 32px;
}
.h2 {
    font-size: 40px;
    margin-bottom: 40px;
    font-weight: 700;
}
.reginputs {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
    margin-bottom: 40px;
}
.reginputs input {
    width: 100%;
    padding: 16px 12px;
    box-sizing: border-box;
    background-color: #494949;
    border: none;
    border-radius: 8px;
    color: rgb(255, 255, 255, .6);
}
form button {
    width: 100%;
    padding: 20px 32px;
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(270deg, rgba(1, 133, 255, 1),rgba(80, 170, 255, 1)) no-repeat;
    border: none;
    border-radius: 32px;
    line-height: 100%;
    margin-bottom: 32px;
}
form ::placeholder {
    color: rgba(255, 255, 255, .6);
}
form p {
    cursor: pointer;
    color: rgb(0, 133, 255);
}
</style>