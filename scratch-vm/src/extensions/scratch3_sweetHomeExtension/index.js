/** @author Guillaume DOEUVRE
 *
 * en - This Scratch extension is designed to enable SweetHome3D to communicate with an arduino board.
 * It is based on the extension of an existing project :
 * https://github.com/kimokipo/SweetHomeExtension2.0
 * 
 * fr - Cette extension de Scratch est édité dans le but de faire communiquer
 * SweetHome3D avec une carte arduino.
 * Elle est édité en reprenant l'extension d'un projet déjà existant :
 * https://github.com/kimokipo/SweetHomeExtension2.0
*/

// Boiler plate from the Scratch Team
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');



let alerted = false;
let connected = false;

class SweetHomeExtension {

    static message = "empty";
    static status = "empty";
    static x_Scratch = 0;
    static y_Scratch = 0;
    static direction_Scratch = 0;
    static x_SH3D = 0;
    static y_SH3D = 0;
    static direction_SH3D = 0;
    static automatic = undefined;
    static sprite = undefined;
    static clickObjectlist = undefined;


    constructor(runtime) {
        this.runtime = runtime;
        SweetHomeExtension.sprite = this.runtime.getSpriteTargetByName("Observer");
        SweetHomeExtension.automatic = false;
        
        if (SweetHomeExtension.sprite) {
            console.log("sweetHomeExtension.sprite ok !");
            this.objectlist = SweetHomeExtension.sprite.lookupVariableById("CNn7j*SP0QT%rN4=j[xz");
        } else {
            //if we can't reade the Json generate from the JavaProject
            alert("developpeur : SweetHomeExtension.sprite ne marche pas!\nVerifiez que le serveur est bien ouvert\nPuis importer le fichier .sb3\nEnfin, demarrez l'extension\n/!\\ respecter l'ordre")
        }
    }

    getInfo() {
        this.connect
        return {
            id: 'SweetHomeExtension',
            name: 'Scratch Home',
            color1: '#0C5986',
            color2: '#34B0F7',
            blocks: this.getBlocks(),
            menus: this.getMenus()
        }
    }

    getBlocks() {
        var typeBlocks = "";
        var result = [{
            opcode: 'setColor',
            blockType: BlockType.COMMAND,
            text: 'color the object : [OBJECT] in [COLORLIST]',
            arguments: {
                OBJECT: {
                    type: ArgumentType.STRING,
                    defaultValue: 'OBJECT_1',
                    menu: 'objectMenu'
                },
                COLORLIST: {
                    type: ArgumentType.STRING,
                    defaultValue: 'noir',
                    menu: 'colorMenu'
                }
            }
        }];

        if (SweetHomeExtension.sprite) {
            typeBlocks = SweetHomeExtension.sprite.lookupVariableById("L^i{fNhE#uQ8.g=D;O~O");
            if (typeBlocks && typeBlocks.value.startsWith("m")) {
                result = [];
                if (this.objectlist.value.length > 0) {
                    result.push({
                        opcode: 'setColor',
                        blockType: BlockType.COMMAND,
                        text: 'color the object : [OBJECT] in [COLORLIST]',
                        arguments: {
                            OBJECT: {
                                type: ArgumentType.STRING,
                                defaultValue: 'objectMenu',
                            },
                            COLORLIST: {
                                type: ArgumentType.STRING,
                                menu: 'colorMenu'
                            }
                        }
                    });
                }
            }
        }
        if (typeBlocks && typeBlocks.value.startsWith("b")) {
            result = [];
            for (let o of this.objectlist.value) {
                result.push({
                    opcode: 'setColor',
                    blockType: BlockType.COMMAND,
                    text: 'color the object : [OBJECT] in [COLORLIST]',
                    arguments: {
                        OBJECT: {
                            type: ArgumentType.STRING,
                            defaultValue: o
                        },
                        COLORLIST: {
                            type: ArgumentType.STRING,
                            menu: 'colorMenu'
                        }
                    }
                });
            }
        }

        return result;
    }

    getMenus() {
        var objectMenu = [];
        var lampMenu = [];

        var result = {
            objectMenuBis: {
                acceptReporters: true,
                items: ['OBJECT_1', 'OBJECT_2', 'OBJECT_3']
            },
            colorMenu: {
                items: ["noir", "bleu", "cyan", "gris", "vert",
                    "magenta", "rouge", "blanc", "jaune"]
            },
        };

        // add menu of objects and lights
        if (this.objectlist && this.objectlist.value.length > 0) {
            result[objectMenu] = { items: this.objectlist.value }
        }
        if (this.lamplist && this.lamplist.value.length > 0) {
            result[lampMenu] = { items: this.lamplist.value }
        }

        return result;

    }



    connect() {
        if (!connected) {
            connect_attempt = true;

            this.socket = new WebSocket("ws://localhost:8000");
            console.log("\n---\nEtat du socket : " + this.socket.readyState + "\n---");

            this.socket.onopen = function (event) {
                console.log("Connexion ouverte !");
                connected = true;
                connect_attempt = true;
            };

            this.socket.onclose = function () {
                if (!alerted) {
                    alert("Connexion fermée");
                    console.log("##########");
                    alerted = true;
                }
                connected = false;
            };
        }
    }


    isConnected() {
        if (this.socket.readyState !== 1) {
            console.log("---\nLe socket n'est pas connecté");
            console.log("this.socket.readyState : " + this.socket.readyState);
            console.log("WebSocket.OPEN : " + WebSocket.OPEN + "\n---");
            alert("S'il y a un problème de communication, essayez d'abord une deuxieme fois. Il peux y avoir un instant avant d'être correctement connecté.\n\nSinon essayez de :\n1.Fermer SweetHome pour fermer correctement le serveur\n2.Relancer SweetHome\n3.Ouvrir votre fichier\n4.Générer un nouveau fichier sb3")
        }
    }

    setColor({ OBJECT, COLORLIST }) {
        this.connect();
        this.send("setColor/" + OBJECT + "/" + COLORLIST);
    }


    send(message) {

        if (!connected) {
            console.log("##########");
            if (this.socket.readyState === 0) {
                console.log("[0] La socket a été créée. La connexion n'est pas encore ouverte.");
            } else if ((this.socket.readyState === 1)) {
                console.log("[1] La connexion est ouverte et prête à communiquer.");
            } else if ((this.socket.readyState === 2)) {
                console.log("[2] The connection is in the process of closing.");
            } else if ((this.socket.readyState === 3)) {
                console.log("[3] La connexion est fermée ou n'a pas pu être ouverte.");
            }
            connected = true;
        }

        if (this.socket && this.socket.readyState === 1) {
            this.socket.send(message);
            console.log("Requête de changement de couleur envoyé")
        }

        this.isConnected()
    }
}

module.exports = SweetHomeExtension;