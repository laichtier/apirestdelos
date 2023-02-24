const webpush = require('web-push');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
const port = 9000
var dataString = '';
var qs = require('querystring');
const vapidKeys = {
    "publicKey": "BKk3LItkX4OwUiMA8Lr2OXQL4fV_mJZoFYNd3xNc1kouHJhKBZMQ60JdVWe4qk5VWHMOI-Vt9gT6DrsNN46HJpk",
    "privateKey": "ntAcVbf-vbQWNHW7MphssJsZ9xhYBWdf-g_riVi37NE"
}

webpush.setVapidDetails(
    'mailto:hectorsalas@juridicodelos.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey

)

const handlerResponse=(res,data,code=200)=>{
    res.status(code).send({data})
}

const savePush=(req,res)=>{
    const name = Math.floor(Date.now()/1000);
    let tokenBrowser =req.body;
    let data = JSON.stringify(tokenBrowser,null,2);
    fs.writeFile(`./tokens/token-${name}.json`,data,(err)=>{
        if (err) throw err;
        handlerResponse(res,`Save success`)
    });
};
const SendPush=(req,res)=>{
    const payload = {
        "notification": {
            "title": "Control jurídico",
            "body": req.body.asunto,
            "vibrate": [100, 50, 100],
            "image": "https://control.juridicodelos.com/assets/logojuridico.png",
            "data": {
                "dateOfArrival": Date.now(),
                "primaryKey": 1
            },
            "actions": [{
                "action": "explore",
                "title": "Goto site"
            }]
        }
    }
    const directoryPath = path.join(__dirname,'tokens');

    fs.readdir(directoryPath,(err,files)=>{
        if(err){
            handlerResponse(res,'Error read',500);
        }
        files.forEach((file)=>{
            const tokenRaw =fs.readFileSync(`${directoryPath}/${file}`);
            const tokenParse = JSON.parse(tokenRaw);
            webpush.sendNotification(
                tokenParse,
                JSON.stringify(payload)).then(res => {
                    console.log('Enviado');
                }).catch(err => {
                    console.log('** USUARIO NO TIENE PERMISOS O LAS KEYS NO SON CORRECTAS', err);
                })
        })
    });
    res.send({data:'Se envío suscribete'})
}
const enviarNotificacion = (req, res) => {
    if (req.method == 'POST') {
        console.log(req.body.asunto)
        const payload = {
            "notification": {
                "title": "Control jurídico",
                "body": req.body.asunto,
                "vibrate": [100, 50, 100],
                "image": "https://control.juridicodelos.com/assets/logojuridico.png",
                "data": {
                    "dateOfArrival": Date.now(),
                    "primaryKey": 1
                },
                "actions": [{
                    "action": "explore",
                    "title": "Goto site"
                }]
            }
        }
        console.log(payload)
        const pushSuscription = {
            endpoint: 'https://wns2-bn3p.notify.windows.com/w/?token=BQYAAAB%2f1Q3ylUNDkl%2f4ZsmapCNhZHuc2wsXCbD2SqJkEj6IbHgUNBCOKArmhlTjaEoQGEWSQwlkVFBqfgoF6FuhI0btehZUKEB8o8%2fIOssSFekygNAu59NYzbTaqkwD%2bW0soEW4LNFuOHCuAF8h%2bTSqMT1V1zi7IKCe20ORqWjSYJVfM6iY%2b1ubFVX%2fAPG6e3GnsNjcok7BBgDeyoENYScIQsD4uuT0ff9x9EPrxmAHScq4UJQ1ocgXtwkO7zrw9Bnv71Wp8GAo35KyQi0V%2fXtJ8iuza3Jtk1NYRaqjH5S4fQ2SCcNfJbKTRR6z5p2NYF79oqY%3d',
            keys: {
                auth: 'bmt45eNRM5ihG_fNyDdyMg',
                p256dh: 'BLUUGM5q3g7oSPDWYwDkAjF-AuG5MuiDAO8QG19hiW3VKIo_cGK2UYtmHJgWnR9EdfZRM2q9R0DSBjgaVS31KQE'
            }
        }
        webpush.sendNotification(
            pushSuscription,
            JSON.stringify(payload)).then(res => {
                console.log('Enviado');
            }).catch(err => {
                console.log('Error', err);
            }

            )
        req
            .on('data', function (data) {
                dataString += data.toString();
                console.log(data);

            })
            .on('end', function () {
                var post = qs.parse(dataString);
                console.log('Si termina');
            })
    }




}

app.route('/save').post(savePush);

app.route('/send').post(SendPush);
app.route('/api/enviar').post(SendPush);


app.listen(port, () => {
    console.log('La aplicación esta en línea');
})  