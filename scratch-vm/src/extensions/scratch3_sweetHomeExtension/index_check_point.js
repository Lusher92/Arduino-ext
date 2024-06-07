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




// has an websocket message already been received
let alerted = false;

let connection_pending = false;

// general outgoing websocket message holder
let msg = null;


// flag to indicate if the user connected to a board
let connected = false;
let connect_attempt = false;


// common


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
                    menu: 'objectMenu' //défini plus tard dans : menu
                    //defaultValue : '',
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
            console.log("Tentative de connection [methode connect]")
            

            // websocket event handlers
            this.socket.onopen = function (event) {
                console.log("Connexion ouverte !");
                connected = true;
                connect_attempt = true;
            };

            this.socket.onclose = function () {
                if (!alerted) {
                    alert("Connexion fermée");
                    alerted = true;
                }
                connected = false;
            };
        }
    }


    isConnected(){
        if (this.socket.readyState !== WebSocket.OPEN) {
            console.log("---\nLe socket n'est pas connecté");
            console.log("this.socket.readyState : " + this.socket.readyState);
            console.log("WebSocket.OPEN : " + WebSocket.OPEN + "\n---");
        }
    }

    setColor({ OBJECT, COLORLIST }) {

        console.log("tentative de connection [methode setColor]");
        this.connect();
        this.send("setColor/" + OBJECT + "/" + COLORLIST);
    }


    send(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        }
        this.isConnected()
    }
}

module.exports = SweetHomeExtension;