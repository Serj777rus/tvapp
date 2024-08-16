require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = 4000;
const https = require('https');
// const http = require('http');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const fsNopromise = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
// const nodemailer = require('nodemailer');
app.use(express.json());
app.use(bodyParser.json());
const publickDirectory = path.join(__dirname, 'playlists');

const options = {
    key: fsNopromise.readFileSync('/etc/letsencrypt/live/webmarvels.ru-0001/privkey.pem'),
    cert: fsNopromise.readFileSync('/etc/letsencrypt/live/webmarvels.ru-0001/fullchain.pem')
};
const server = https.createServer(options, app)
app.use(express.static(publickDirectory)); //раздача статических файлов из диретории

//Настройки Nodemailer
// const transport = nodemailer.createTransport({
//     host: '',
//     port: '',
//     secure: true,
//     auth: {
//         user: '',
//         pass: ''
//     }
// })
const BASE = process.env.BASE
const USERBASE = process.env.USERBASE
const PASSBASE = process.env.PASSBASE
const PORTBASE = process.env.PORTBASE
const SOCKET = process.env.SOCKET

//Настройки БД
const sequelize = new Sequelize(BASE, USERBASE, PASSBASE,{
    host: '127.0.0.1',
    port: PORTBASE,
    dialect: 'mysql',
    dialectOptions: {
        socketPath: SOCKET
    },
    pool: {
        max: 1000,
        min: 0
    }
});

const JWT_SECRET = 'lilitopchik10061997'; //секретный ключ jwt

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
        await sequelize.sync({alter: true}); 
        console.log('Синхронизация завершена');
    } catch (e) {
        console.error('Ошибка при синхронизации:', e);
    // } finally {
    //     await dissDb(); 
    }
}

sichDb(); // Вызов функции


//Модели
//Пользователи
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
    },
    jwt: {
        type: DataTypes.STRING,
        allowNull: true
    },
    usertable: {
        type: DataTypes.STRING,
        allowNull:true
    }
})
//Модель сохранения видео в бд
const Video = sequelize.define('videos', {
   id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
   },
   title: {
    type: DataTypes.STRING,
    allowNull: false
   },
   description: {
    type: DataTypes.STRING,
    allowNull: true
   },
   thumb: {
    type: DataTypes.STRING,
    allowNull: true
   },
   duration: {
    type: DataTypes.STRING,
    allowNull: true
   },
   link: {
    type: DataTypes.STRING,
    allowNull: false
   }
})
//функция создания таблицы пользателя для хранения видеозаписей
async function createTable(replaceMail, title, thumb, link) {
    const CustomTable = sequelize.define('custom_table', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        thumb: {
            type: DataTypes.STRING,
            allowNull: true
        },
        link: {
            type: DataTypes.STRING(1000),
            allowNull: false
        }
    },
    {
        tableName: replaceMail
    })
    await sichDb();
    if (title && thumb && link) {
        await CustomTable.create({
            title: title,
            thumb: thumb,
            link: link
        })
        console.log('Данные записаны в таблицу');
        const allVideo = await CustomTable.findAll();
        console.log(allVideo, replaceMail)
        writeFile(allVideo,replaceMail)
    } else {
        console.log('Таблица создана')
    }
}
//Функция записи в файл
async function writeFile(allVideo, replaceMail) {
    const pathFile = path.join(__dirname,'playlists', replaceMail, 'pl.m3u');

    try {
        // Открываем файл и очищаем его
        await fs.writeFile(pathFile, '#EXTM3U\n'); // Это заменяет содержимое файла и сразу записывает начальный текст

        // Записываем каждую строку
        for (const el of allVideo) {
            const line = `#EXTINF:0 type="video" tvg-logo="${el.dataValues.thumb}", ${el.dataValues.title}\n${el.dataValues.link}\n`;
            await fs.appendFile(pathFile, line);
        }

        console.log('Файл успешно записан');
    } catch (err) {
        console.error('Ошибка при записи в файл:', err);
        throw err; // Передаём ошибку выше
    }
}
//Функция поллучения видеозаписией
async function getVideosOfUser(usertable) {
    const CustomTable = sequelize.define('custom_table', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        thumb: {
            type: DataTypes.STRING,
            allowNull: true
        },
        link: {
            type: DataTypes.STRING(1000),
            allowNull: false
        }
    },
    {
        tableName: usertable
    })
    const videos = await CustomTable.findAll()
    return videos;
}
//Функция отправки письма при регистрации
// async function sendMailToUser(mail, name) {
//     try {
//         const response = await transport.sendMail({
//             from: '',
//             to: '',
//             subject: '',
//             html: ''
//         })
//         if (response) {
//             return(response.data)
//         }
//     } catch(error) {
//         console.log(error)
//     }
// }
var salt = bcrypt.genSaltSync(10); //cоль для хэширования паролей

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
        const hashPass = bcrypt.hashSync(pass, salt);
        console.log(hashPass)
        try {
            await connDb();
            const response = await Users.create({name: name, mail: mail, password: hashPass});
            const resAgain = await Users.findOne({where: {mail: mail}});
            const id = resAgain.dataValues.id;
            const userName = resAgain.dataValues.name;
            const playload = {
                id: id,
                name: userName
            }
            const token = jwt.sign(playload, JWT_SECRET, {expiresIn: '365d'}); //создаем jwt токен
            console.log(id, userName, playload, token);
            //создаем таблицу
            const replaceMail = mail.replace(/[@,.\-!]/g, '');
            await createTable(replaceMail);
            // создаем директорию
            await fs.mkdir(`playlists/${replaceMail}`, { recursive: true }, (err) => {
                if (err) throw err;
                console.log('Директория создана');
            });
            //создаем файл
            const fileDescriptor = await fs.open(`playlists/${replaceMail}/pl.m3u`, 'w')
            await fileDescriptor.close()
            console.log('Файл создан')
            //обновляем таблицу jwt и названием таблицы пользователя
            const uPd = await Users.update({jwt: token, usertable: replaceMail}, {where: {mail: mail}});
            // await sendMailToUser(mail, name);
            if(response && resAgain && uPd) {
                res.status(200).json({jwt: token})
            }
        } catch(error) {
            console.log(error)
        }
    }
    // await dissDb();
})
app.post('/login', async(req, res) => {
    const { mail, pass } = req.body;
    console.log(mail, pass);
    try {
        await connDb();
        const response = await Users.findOne({where: {mail: mail}})
        console.log(response)
        if (response) {
            const isMatch = await bcrypt.compare(pass, response.dataValues.password);
            if (isMatch) {
                if (response.dataValues.jwt && response.dataValues.jwt !== null) {
                    res.status(200).json({jwt: response.dataValues.jwt})
                } else {
                    const playload = {
                        id: response.dataValues.id,
                        name: response.dataValues.name
                    }
                    const token = jwt.sign(playload, JWT_SECRET, {expiresIn: '365d'});
                    console.log(token);
                    const update = await Users.update({jwt: token}, {where: {mail:mail}})
                    if (update) {
                        res.status(200).json({jwt: token});
                    }
                }
            }
        } else {
            res.status(400).json({message: 'Такого пользователя не существует'})
        }
    } catch(error) {
        console.log(error)
    }
})

app.get('/isAuth', async (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];

    try {
        const userId = jwt.verify(token, JWT_SECRET).id;
        console.log(userId);
        
        const response = await Users.findOne({where: {id: userId}})
        if (response) {
            if (response.dataValues.jwt === token) {
                const resVid = await getVideosOfUser(response.dataValues.usertable);
                return res.status(200).json({datas: resVid})
            } else {
                return res.status(500).send('Не авторизован')
            }
        }
        
    } catch (error) {
        console.log('Token error:', error);
        return res.status(403).send('Неверный или истекший токен');
    }
});

app.get('/logOut', async (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];
    const userId = jwt.verify(token, JWT_SECRET).id
    try {
        const response = await Users.update({jwt: null}, {where: {id: userId}})
        res.status(200).send('Вы вышли из системы');
    } catch(error) {
        console.log(error)
    }
})

app.post('/getdata', async (req, res) => {
    const link = req.body.link;
    console.log(link);
    const regVk = /https:\/\/vk/;
    const regRt = /https:\/\/rutube/;
    const regYt = /https:\/\/youtube/;
    const reYttwo = /https:\/\/youtu/;

    if (regVk.test(link) || regYt.test(link) || reYttwo.test(link)) {
        getVk(link, res);
    } else if (regRt.test(link)) {
        getLinkRu(link, res);
    } else {
        console.log('Не работает');
    }
})

app.post('/savevideo', async(req, res) => {
    const { title, thumb, link } = req.body;
    console.log(title, thumb, link)
    const token = req.headers['authorization'].split(' ')[1];
    const userId = jwt.verify(token, JWT_SECRET).id;
    try {
        const findUser = await Users.findOne({where: {id: userId}});
        if (findUser) {
            const replaceMail = findUser.dataValues.usertable;
            await createTable(replaceMail, title, thumb, link);
            const getVideo = await getVideosOfUser(replaceMail);
            res.status(200).send({message: 'данные записаны', datas: getVideo})
        } else {
            res.status(500).send('Ошибка записи')
        }
    } catch(error) {
        console.log(error);
    }
})
app.post('/deleteItem', async(req,res) => {
    const token = req.headers['authorization'].split(' ')[1];
    const videoId = req.body.id
    console.log(videoId, token)
    try {
        const userId = jwt.verify(token, JWT_SECRET).id;
        const responseUser = await Users.findOne({where: {id: userId}})
        const tableName = responseUser.dataValues.usertable;
        const CustomTable = sequelize.define('custom_table', {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false
            },
            thumb: {
                type: DataTypes.STRING,
                allowNull: true
            },
            link: {
                type: DataTypes.STRING(1000),
                allowNull: false
            }
        },
        {
            tableName: tableName
        })
        const deleteItem = await CustomTable.destroy({where: {id: videoId}});
        if (deleteItem) {
            const responsNewData = await CustomTable.findAll();
            await writeFile(responsNewData, tableName)
            res.status(200).json({datas: responsNewData})
        }
    } catch(error) {
        console.log(error);
    }
})
//Получения списка видео после добавления
// app.get('/updata', async(req,res) => {
//     const token = req.headers['authorization'].split(' ')[1];
//     console.log('Токен',token)
//     try {
//         const userId = jwt.verify(token, JWT_SECRET).id
//         console.log('Юзер', userId)
//         const responseUser = await Users.findOne({where: {id: userId}});
//         console.log('Ответ БД', responseUser)
//         const userTable = responseUser.dataValues.usertable;
//         console.log('Назывние таблицы', userTable)
//         const CustomTable = sequelize.define('custom_table', {
//             id: {
//                 type: DataTypes.INTEGER,
//                 autoIncrement: true,
//                 primaryKey: true
//             },
//             title: {
//                 type: DataTypes.STRING,
//                 allowNull: false
//             },
//             thumb: {
//                 type: DataTypes.STRING,
//                 allowNull: true
//             },
//             link: {
//                 type: DataTypes.STRING(1000),
//                 allowNull: false
//             }
//         },
//         {
//             tableName: userTable
//         });
//         const responsNewData = await CustomTable.findAll();
//         res.status(200).json({datas: responsNewData})
//     } catch(error) {
//         console.log(error)
//     }
// })
//Проверка пользователя
app.post('/checkmail', async(req,res) => {
    const email = req.body.email
    console.log(email);
    try {
        const response = await Users.findOne({where: {mail: email}});
        console.log(response);
        if (response == null) {
            return res.status(200).json({message: 'Email свободен', status: '200'})
        } else if(response.dataValues.mail === email) {
            return res.status(200).json({message: 'Такой пользователь уже зарегистрирован', status: '400'})
        }
    } catch(error) {
        console.log(error)
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
})
async function getVk(link, res) {
    try {
        const response = await axios.get(`https://theofficialvkr.xyz/data/trial.php?vkr=${link}`);
        res.send(response.data)
    } catch(error) {
        res.status(500).send(`Error fetching the URL: ${error.message}`);
    }
}

async function getLinkRu(link, res) {
    const reg = /https:\/\/rutube\.ru\/video\//;
    const regOpt = /r=wd/
    link = link.replace(reg, 'https://rutube.ru/api/play/options/')
    link = link.replace(regOpt, 'no_404=true&referer=https%253A%252F%252Frutube.ru&pver=v2&yclid=1722022439692254743');
    // console.log(link);

    const response = await axios.get(link);
    // console.log(response.data.video_balancer.m3u8)
    getLink(response.data.video_balancer.m3u8, response.data.thumbnail_url, response.data.title, res);
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

async function getLink(url, img, title, res) {
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
        // console.log(response.data);
        res.status(200).json({links: response.data, thumb: img, title: title});
    } catch(error) {
        console.log(error);
        res.status(500).send('Ошибка сервера');
    }
}

server.listen(port, () => {
    console.log(`Proxy server listening at http://localhost:${port}`);
});