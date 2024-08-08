import { createApp } from 'vue'
import App from './App.vue'
import Home from './components/Home.vue';
import Auth from './components/Auth.vue';
import 'normalize.css';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    routes: [{
        path: '/',
        component: Home,
        name: 'home'
        },
        {
        path: '/auth',
        component: Auth,
        name: 'auth'
        }
    ],
    history: createWebHistory()
})

const app = createApp(App);
app.use(router);
app.mount('#app')
