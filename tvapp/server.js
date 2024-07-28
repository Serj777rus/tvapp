const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Разрешить все источники
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    req.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    next();
});
app.get('/proxy', async (req, res) => {
    try {

        const url = decodeURIComponent(req.query.url);
        // const response = await axios.get(url, {headers: {
        //     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        //     'Referer': 'https://vk.com'
        // }});
        // const urlPattern = /"url\d+":\s*"([^"]+)"/g;

        // let arrLink = [];
        //     let match;
            
        //     // Ищем все совпадения
        //     while ((match = urlPattern.exec(response.data)) !== null) {
        //         const result = {
        //             format: '',
        //             url: ''
        //         };
        //         // match[1] — ключ, match[2] — значение
        //         let key = match[0];
        //         let value = match[1];
                
        //         // Удаляем экранирующие символы (например, \\/ заменяем на /)
        //         value = value.replace(/\\\//g, '/');
        //         value = value.replace(/.me/g, '.me/')
        //         // Добавляем пару ключ-значение в объект
        //         // result[key] = value;
        //         result.format = key;
        //         result.url = value;
        //         arrLink.push(result);
        //     }

        // res.send(arrLink)
        const response = await axios.get(`https://theofficialvkr.xyz/data/trial.php?vkr=${url}`);
        console.log(response.data);
        res.send(response.data)
        // console.log(response.data)
    } catch (error) {
        res.status(500).send(`Error fetching the URL: ${error.message}`);
    }
    
});

app.listen(port, () => {
    console.log(`Proxy server listening at http://localhost:${port}`);
});
//https://vk6-6.vkuser.net/?srcIp=154.49.140.125&pr=40&expires=1722480987609&srcAg=CHROME&fromCache=1&ms=95.142.206.165&type=2&sig=n2euyOgm68Q&ct=0&urls=185.226.53.162%3B185.226.52.204&clientType=13&appId=512000384397&zs=43&id=6919308184142
//https://vkvd450.mycdn.me//?srcIp=185.165.160.209&pr=40&expires=1722481149457&srcAg=CHROME_MAC&fromCache=1&ms=185.226.53.162&type=2&sig=A58gi7W-jpY&ct=0&urls=185.226.52.204&clientType=13&appId=512000384397&id=6919308184142