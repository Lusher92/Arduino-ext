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
    static clickobjectlist = undefined;


    constructor(runtime) {
        this.runtime = runtime;
        SweetHomeExtension.sprite = this.runtime.getSpriteTargetByName("Observer");
        SweetHomeExtension.automatic = false;

        if (SweetHomeExtension.sprite) {

            // initialize x,y and direction of Observer sprite with its current position
            SweetHomeExtension.x_Scratch = SweetHomeExtension.sprite.x;
            SweetHomeExtension.y_Scratch = SweetHomeExtension.sprite.y;
            SweetHomeExtension.direction_Scratch = SweetHomeExtension.sprite.direction;


            console.log("sweetHomeExtension.sprite ok !");
            this.objectlist = SweetHomeExtension.sprite.lookupVariableById("CNn7j*SP0QT%rN4=j[xz");
            this.lamplist = SweetHomeExtension.sprite.lookupVariableById("GoN|030ruZ,{H+4$)C-$");

            var clickobjectlist = {};
            for (let o of this.objectlist.value) {
                clickobjectlist[o] = false;
            }
            SweetHomeExtension.clickobjectlist = clickobjectlist;

            // Create a list of lights with their status (On or Off)
            this.statusLightlist = {};
            for (let l of this.lamplist.value) {
                this.statusLightlist[l] = "Off";
            }

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
            color1: '#FFA500',
            color2: '#B87E14',
            blocks: this.getBlocks(),
            menus: this.getMenus()
        }
    }

    getBlocks() {
        var typeBlocks = "";
        var result = [{
            opcode: 'setColor',
            blockType: BlockType.COMMAND,
            text: 'color the object : [object] in [colorList]',
            arguments: {
                object: {
                    type: ArgumentType.STRING,
                    defaultValue: 'object_1',
                    menu: 'objectMenu'
                },
                colorList: {
                    type: ArgumentType.STRING,
                    defaultValue: 'noir',
                    menu: 'colorMenu'
                }
            }
        /*
        },{
            opcode: "switchOnOff",
			blockType: BlockType.COMMAND,
			text: "[switchList] the [lamp]",
			arguments: {
				switchList: {
					type: ArgumentType.STRING,
					menu: "switchMenu"
				},
				lamp: {
					type: ArgumentType.STRING,
					defaultValue: ""
				},
			}
        */        
        }];

        if (SweetHomeExtension.sprite) {
            typeBlocks = SweetHomeExtension.sprite.lookupVariableById("L^i{fNhE#uQ8.g=D;O~O");
            if (typeBlocks && typeBlocks.value.startsWith("m")) {
                result = [];
                if (this.objectlist.value.length > 0) {
                    result.push({
                        opcode: 'setColor',
                        blockType: BlockType.COMMAND,
                        text: 'color the object : [object] in [colorList]',
                        arguments: {
                            object: {
                                type: ArgumentType.STRING,
                                defaultValue: 'objectMenu',
                            },
                            colorList: {
                                type: ArgumentType.STRING,
                                menu: 'colorMenu'
                            }
                        }
                    });
                    result.push({
                        opcode: "isobjectClicked",
                        blockType: BlockType.BOOLEAN,
                        text: "[object] is clicked ?",
                        arguments: {
                            object: {
                                type: ArgumentType.STRING,
                                menu: "objectMenu"
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
                    text: 'color the object : [object] in [colorList]',
                    arguments: {
                        object: {
                            type: ArgumentType.STRING,
                            defaultValue: o
                        },
                        colorList: {
                            type: ArgumentType.STRING,
                            menu: 'colorMenu'
                        }
                    }
                });
            }
        }
        if (this.objectlist && this.objectlist.value.length > 0) {
            for (let o of this.objectlist.value) {
                result.push({
                    opcode: "isobjectClicked",
                    blockType: BlockType.BOOLEAN,
                    text: "[object] is clicked ?",
                    arguments: {
                        object: {
                            type: ArgumentType.STRING,
                            defaultValue: o
                        }
                    }
                });
            }
        }

        result.push(
            {
                opcode: 'getMessage',
                blockType: BlockType.REPORTER,
                text: "message"
            });
        result.push(
            {
                opcode: 'getStatus',
                blockType: BlockType.REPORTER,
                text: "status"
            });
        result.push(
            {
                opcode: 'getX_SH3D',
                blockType: BlockType.REPORTER,
                text: "x_SH3D"
            });
        result.push(
            {
                opcode: 'getY_SH3D',
                blockType: BlockType.REPORTER,
                text: "y_SH3D"
            });
        result.push(
            {
                opcode: 'getDirection_SH3D',
                blockType: BlockType.REPORTER,
                text: "direction_SH3D"
            });

        return result;
    }

    getMenus() {
        var objectMenu = [];
        var lampMenu = [];

        var result = {
            objectMenuBis: {
                acceptReporters: true,
                items: ['object_1', 'object_2', 'object_3']
            },
            colorMenu: {
                //items: ["noir", "bleu", "cyan", "gris", "vert", "magenta", "rouge", "blanc", "jaune"]
                items: ["black", "blue", "cyan", "grey", "green", "magenta", "red", "white", "yellow"]
            },
            switchMenu: {
				items: ["Allumer", "Eteindre", "Changer Etat"]
			}
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

            this.socket = new WebSocket("ws://localhost:8000");
            console.log("\n---\nEtat du socket : " + this.socket.readyState + "\n---");

            this.socket.onopen = function (event) {
                console.log("Connexion ouverte !");
                connected = true;
                SweetHomeExtension.status = "Connected!";
            };

            this.socket.onmessage = function (event) {
                var msgrec = event.data

                if (msgrec.startsWith("position")) {
                    var pos = msgrec.split("/")
                    SweetHomeExtension.x_SH3D = parseFloat(pos[1]);
                    SweetHomeExtension.y_SH3D = parseFloat(pos[2]);
                    SweetHomeExtension.direction_SH3D = parseFloat(pos[3]);
    

                    if (SweetHomeExtension.sprite && pos[4]) {
    
                        // adapt position and direction to match Scratch View
                        var x = -240 + (SweetHomeExtension.x_SH3D + 200) * 480 / (SweetHomeExtension.width_SH3D.value);
                        var y = 180 + (-SweetHomeExtension.y_SH3D + 60) * 360 / (SweetHomeExtension.height_SH3D.value);
                        var direction = (SweetHomeExtension.direction_SH3D * 180 / Math.PI - 90);
                        SweetHomeExtension.sprite.setXY(x, y);
                        SweetHomeExtension.sprite.setDirection(direction);
                    }

                } else if (msgrec.startsWith("click")) {
                    var click = msgrec.split("/")
                    SweetHomeExtension.clickObjectlist[click[1]] = true;
    

                } else if (msgrec.startsWith("automatic")) {
                    var auto = msgrec.split("/");
                    if (auto[1]) {
                        SweetHomeExtension.automatic = true;
                    } else {
                        SweetHomeExtension.automatic = false;
                    }
    
                    //else store the message on the static variable message
                } else {
                    SweetHomeExtension.message = event.data;
                }
            };


            this.socket.onclose = function () {
                if (!alerted) {
                    alert("Connexion fermée");
                    console.log("##########");
                    alerted = true;
                }
                connected = false;
            };

        } else {
            this.sendPosition();
            return;
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

    setColor({ object, colorList }) {
        this.connect();
        this.send("setColor/" + object + "/" + colorList);
    }


    isObjectClicked({ object }) {
        // store the value (true or false) of this object in clickObjectlist, and set it to false
        var result = SweetHomeExtension.clickObjectlist[object];
        SweetHomeExtension.clickObjectlist[object] = false;
        return result;
    }

    getMessage() {
        this.connect();
        return SweetHomeExtension.message;
    }

    getStatus() {
        this.connect();
        return SweetHomeExtension.status;
    }

    getX_SH3D() {
        return SweetHomeExtension.x_SH3D;
    }

    getY_SH3D() {
        return SweetHomeExtension.y_SH3D;
    }

    getDirection_SH3D() {
        return SweetHomeExtension.direction_SH3D;
    }

    sendPosition(text) {
        if (SweetHomeExtension.automatic === true) {
            if (SweetHomeExtension.sprite.x !== SweetHomeExtension.x_Scratch | SweetHomeExtension.sprite.y !== SweetHomeExtension.y_Scratch | SweetHomeExtension.sprite.direction !== SweetHomeExtension.direction_Scratch) {
                SweetHomeExtension.x_Scratch = SweetHomeExtension.sprite.x;
                SweetHomeExtension.y_Scratch = SweetHomeExtension.sprite.y;
                SweetHomeExtension.direction_Scratch = SweetHomeExtension.sprite.direction;

                // adapt position to match SweetHome3D view
                var x = -200 + (SweetHomeExtension.x_Scratch + 240) * (SweetHomeExtension.width_SH3D.value) / 480;
                var y = -(-60 + (SweetHomeExtension.y_Scratch - 180) * (SweetHomeExtension.height_SH3D.value) / 360);
                var direction = ((SweetHomeExtension.direction_Scratch + 90) * Math.PI / 180);

                this.send("position/" + x + "/" + y + "/" + direction);
                SweetHomeExtension.x_SH3D = x;
                SweetHomeExtension.y_SH3D = y;
                SweetHomeExtension.direction_SH3D = direction;

            }
        }
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