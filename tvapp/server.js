const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Разрешить все источники
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});
app.get('/proxy', async (req, res) => {
    try {

        const url = decodeURIComponent(req.query.url);
        const response = await axios.get(url);
        const urlPattern = /"url\d+":\s*"([^"]+)"/g;

        let arrLink = [];
            let match;
            
            // Ищем все совпадения
            while ((match = urlPattern.exec(response.data)) !== null) {
                const result = {
                    format: '',
                    url: ''
                };
                // match[1] — ключ, match[2] — значение
                let key = match[0];
                let value = match[1];
                
                // Удаляем экранирующие символы (например, \\/ заменяем на /)
                value = value.replace(/\\\//g, '/');
                // Добавляем пару ключ-значение в объект
                // result[key] = value;
                result.format = key;
                result.url = value;
                arrLink.push(result)
            }

        res.send(arrLink)
    } catch (error) {
        res.status(500).send(`Error fetching the URL: ${error.message}`);
    }
    
});

app.listen(port, () => {
    console.log(`Proxy server listening at http://localhost:${port}`);
});