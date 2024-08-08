require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;
const http = require('http');
const bcrypt = require('bcrypt');
// const session = require('express-session');
// const RedisStore = require('connect-redis')(session);
// const redis = require('redis');
const server = http.createServer(app)
// const fs = require('fs');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');

app.use(express.json());
app.use(bodyParser.json());
const sequelize = new Sequelize('mysql', 'root', 'root',{
    host: '127.0.0.1',
    port: 8889,
    dialect: 'mysql',
    dialectOptions: {
        socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
    }
});
async function connDb() {
    try {
        await sequelize.authenticate();
        console.log('Соединение установлено');
    } catch (e) {
        console.error('Невозможно выполнить подключение к БД:', e);
        throw e; 
    }
}

async function dissDb() {
    try {
        await sequelize.close(); 
        console.log('Соединение закрыто');
    } catch (e) {
        console.error('Ошибка при закрытии соединения:', e);
    }
}

async function sichDb() {
    try {
        await connDb(); 
        await sequelize.sync(); 
        console.log('Синхронизация завершена');
    } catch (e) {
        console.error('Ошибка при синхронизации:', e);
    // } finally {
    //     await dissDb(); 
    }
}

sichDb(); // Вызов функции

//Модели
const Users = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mail: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,

        allowNull: false
    }
})


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Разрешить все источники
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    req.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    next();
});

app.post('/register', async(req, res) => {
    const {name, mail, pass, confirm} = req.body;
    console.log(name, mail, pass, confirm)
    if (pass !== confirm) {
        res.status(400).json({message: 'Пароли не совпадают'});
        return;
    } else {
        var salt = bcrypt.genSaltSync(10);
        const hashPass = bcrypt.hashSync(pass, salt);
        console.log(hashPass)
        try {
            await connDb();
            const response = await Users.create({name: name, mail: mail, password: hashPass});
            if(response) {
                res.status(200).send('Зареган')
            }
        } catch(error) {
            console.log(error)
        }
    }
    await dissDb();
})

app.post('/getdata', async (req, res) => {
    const link = req.body.link;
    console.log(link);
    const regVk = /https:\/\/vk/;
    const regRt = /https:\/\/rutube/;
    const regYt = /https:\/\/youtube/;

    if (regVk.test(link) || regYt.test(link)) {
        getVk(link, res);
    } else if (regRt.test(link)) {
        getLinkRu(link, res);
    } else {
        console.log('Не работает');
    }
})

async function getVk(link, res) {
    try {
        const response = await axios.get(`https://theofficialvkr.xyz/data/trial.php?vkr=${link}`);
        console.log(response.data);
        res.send(response.data)
    } catch(error) {
        res.status(500).send(`Error fetching the URL: ${error.message}`);
    }
};

async function getLinkRu(link, res) {
    const reg = /https:\/\/rutube\.ru\/video\//;
    const regOpt = /r=wd/
    link = link.replace(reg, 'https://rutube.ru/api/play/options/')
    link = link.replace(regOpt, 'no_404=true&referer=https%253A%252F%252Frutube.ru&pver=v2&yclid=1722022439692254743');
    console.log(link);

    const response = await axios.get(link);
    console.log(response.data.video_balancer.m3u8)
    getLink(response.data.video_balancer.m3u8, res);
}

// app.get('/proxy', async (req, res) => {
//     try {

//         const url = decodeURIComponent(req.query.url);
//         // const response = await axios.get(url, {headers: {
//         //     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
//         //     'Referer': 'https://vk.com'
//         // }});
//         // console.log(response.data)
//         // const urlPattern = /"url\d+":\s*"([^"]+)"/g;

//         // let arrLink = [];
//         //     let match;
            
//         //     // Ищем все совпадения
//         //     while ((match = urlPattern.exec(response.data)) !== null) {
//         //         const result = {
//         //             format: '',
//         //             url: ''
//         //         };
//         //         // match[1] — ключ, match[2] — значение
//         //         let key = match[0];
//         //         let value = match[1];
                
//         //         // Удаляем экранирующие символы (например, \\/ заменяем на /)
//         //         value = value.replace(/\\\//g, '/');
//         //         value = value.replace(/\.me/g, '.me/')
//         //         // Добавляем пару ключ-значение в объект
//         //         // result[key] = value;
//         //         result.format = key;
//         //         result.url = value;
//         //         arrLink.push(result);
//         //     }

//         // res.send(arrLink)
//         const response = await axios.get(`https://theofficialvkr.xyz/data/trial.php?vkr=${url}`);
//         console.log(response.data);
//         res.send(response.data)
//         // console.log(response.data)
//     } catch (error) {
//         res.status(500).send(`Error fetching the URL: ${error.message}`);
//     }
    
// });

async function getLink(url, res) {
    try {
        const regex = /[?&]([^=#]+)=([^&#]*)/g;

        let match;
        let param = {}
        while (match = regex.exec(url)) {
        param[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
        }
        const params = {
            guids: param.guids,
            sign: param.sign,
            expire: param.expire,
            guarantee: param.guarantee,
            scheme: param.scheme
          };
          
          const headers = {
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br, zstd',
            'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
            'origin': 'https://rutube.ru',
            'priority': 'u=1, i',
            'referer': 'https://rutube.ru/',
            'sec-ch-ua': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
          };
        
        const response = await axios.get(url, { params, headers });
        
        console.log(response.data);
        res.send(response.data);
    } catch(error) {
        console.log(error);
        res.status(500).send('Ошибка сервера');
    }
}

server.listen(port, () => {
    console.log(`Proxy server listening at http://localhost:${port}`);
});