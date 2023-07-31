const RPC = require('discord-rpc');
const axios = require('axios');
const moment = require('moment');
const { decode } = require('html-entities');
const { parseString } = require('xml2js');

const clientId = '1135335942933200970';
RPC.register(clientId);
const client = new RPC.Client({ transport: 'ipc' });

client.on('ready', () => {
    console.log(`Connected to Discord! (${client.user.username} - ${client.user.id})`);
    GetVlcData();
});

function GetVlcData() {
    let output;
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

            const Music = jsonDataParsed.root.information[0].category[0].info;

            if (Music) {
                let title;
                let author;
                let filename;
                let url;
                let MusicStatus;
                let MusicIcon;
                Music.map((information) => {
                    switch (information.$.name) {
                        case "title":
                            title = decode(information._);
                            break;
                        case "artist":
                            author = decode(information._);
                            break;
                        case "filename":
                            filename = information._;
                            break;
                        case "purl":
                            url = information._;
                            break;
                        default:
                            break;
                    }
                });
                let largeIconKey = filename.slice(0, -4);

                if (jsonDataParsed.root.state[0] === "playing") {
                    MusicStatus = "En cours";
                    MusicIcon = "play";
                } else {
                    MusicStatus = "En pause";
                    MusicIcon = "pause";
                };

                output = {
                    details: `${title}`,
                    state: `By ${author}`,
                    largeImageKey: `http://144.217.4.195:26001/data/${largeIconKey}.png`,
                    largeImageText: `Made by ${author}`,
                    smallImageKey: `${MusicIcon}`,
                    smallImageText: `${MusicStatus}`,
                    instance: false,
                    startTimestamp: Date.now(),
                    endTimestamp: Date.now() + ((result.root.length[0] - result.root.time[0]) * 1000),
                    buttons: [
                        {
                            label: "Ecouter",
                            url: url
                        },
                        {
                            label: "Disocrd SCP CTG",
                            url: "https://discord.gg/qZAXn6PXrj"
                        }
                    ]
                };
            } else {

                output = {
                    details: `Aucune musique`,
                    state: "Aucune musique en cours",
                    largeImageKey: "",
                    largeImageText: "",
                    smallImageKey: "",
                    smallImageText: "",
                    instance: false,
                    startTimestamp: Date.now(),
                    buttons: [
                        {
                            label: "Ecouter",
                            url: "twitch.tv/lebouseuh"
                        },
                        {
                            label: "Voir le site",
                            url: "https://lebouseuh.net"
                        }
                    ]
                };
            }

            ActivityChange(output);
        });
    }).catch((err) => {
        output = {
            details: `Aucune musique`,
            state: "Aucune musique en cours",
            largeImageKey: "",
            largeImageText: "",
            smallImageKey: "",
            smallImageText: "",
            instance: false
        };
        
        ActivityChange(output);
    });
}

function ActivityChange(json) {
    client.setActivity(json);

    setTimeout(GetVlcData, 1000);
}

//GetVlcData();

client.login({ clientId }).catch(console.error);