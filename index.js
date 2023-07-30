const RPC = require('discord-rpc');
const axios = require('axios');
const moment = require('moment');
const { decode } = require('html-entities');
const { parseString } = require('xml2js');

const clientId = '1135146769160884296';
RPC.register(clientId);
const client = new RPC.Client({ transport: 'ipc' });

client.on('ready', () => {
    console.log(`Connected to Discord! (${client.user.username} - ${client.user.id})`);
    GetVlcData();
});

function GetVlcData() {
    axios({
        method: 'get',
        url: 'http://localhost:8080/requests/status.xml',
        auth: {
            username: '',
            password: 'azerty'
        }
    }).then(function (response) {
        parseString(response.data, function (err, result) {
            if (err) throw err;

            const jsonData = JSON.stringify(result);
            const jsonDataParsed = JSON.parse(jsonData);

            if (jsonDataParsed.root.information[0]) {
                let titlte = decode(jsonDataParsed.root.information[0].category[0].info.pop()._);
                let author = jsonDataParsed.root.information[0].category[0].info[3]._;
                let filename = jsonDataParsed.root.information[0].category[0].info[5]._;
                let largeIcon = filename.slice(0, -4);
                console.log(largeIcon);

                const output = {
                    details: `${titlte}`,
                    state: `By ${author}`,
                    largeImageKey: `${largeIcon}`,
                    largeImageText: "test",
                    smallImageKey: "music",
                    smallImageText: "test",
                    instance: false            
                }

                ActivityChange(output);
            };
        });
    }).catch((err) => {
        console.log(err);
    });
}

function ActivityChange(json) {
    client.setActivity(json);

    setTimeout(GetVlcData, 1000);
}

//GetVlcData();

client.login({ clientId }).catch(console.error);

function deleteSpace(chaine) {
    let resultat = '';
    let ajoutEspace = true;
  
    for (let i = 0; i < chaine.length; i++) {
        const caractere = chaine[i];
        if (ajoutEspace && caractere === ' ') {
        } else {
            resultat += caractere;
            ajoutEspace = false;
        }
    }

    return resultat;
}