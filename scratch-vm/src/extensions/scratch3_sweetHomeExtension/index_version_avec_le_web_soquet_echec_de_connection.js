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


// croix noir : iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAn1BMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKCgoKCgoAAAAAAAAAAAAAAAAAAAAUFBQUFBQAAAAODg4AAAAAAAAQEBAAAAAcHBwAAAAbGxsbGxsZGRkaGhpAQEAZGRkuLi4uLi5paWkjIyOOjo4oKCh9fX2Hh4cvLy87OzuBgYGKioqampqhoaGxsbHHx8fW1tbd3d3w8PD39/f///++xlGHAAAAKHRSTlMACgwRGhsfIScxMklRUlVWWltrcIiJn7W4xM/Z39/n6enq8/f8/f7+MmotOAAAAAFiS0dENKmx6f0AAACOSURBVBgZBcFHcsJAEADAnmElKIFDyb7w//f5YIMCSutuAACUBoCmSKUHoC/SfLwDfOwzxD2BuCdJHXvgezhI/J4ucMk/BDS1dnWKWFHQNte3YnsMsRC6ryhtl45x2Y6fqfjsc9uTzGs5jilFqAFRRTgpsbZ7E+pShvExB+dbc25DXV7r8yWA9ua5AAAA/8+pMamN7acUAAAAAElFTkSuQmCC
// observer : data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAn1BMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKCgoKCgoAAAAAAAAAAAAAAAAAAAAUFBQUFBQAAAAODg4AAAAAAAAQEBAAAAAcHBwAAAAbGxsbGxsZGRkaGhpAQEAZGRkuLi4uLi5paWkjIyOOjo4oKCh9fX2Hh4cvLy87OzuBgYGKioqampqhoaGxsbHHx8fW1tbd3d3w8PD39/f///++xlGHAAAAKHRSTlMACgwRGhsfIScxMklRUlVWWltrcIiJn7W4xM/Z39/n6enq8/f8/f7+MmotOAAAAAFiS0dENKmx6f0AAACOSURBVBgZBcFHcsJAEADAnmElKIFDyb7w//f5YIMCSutuAACUBoCmSKUHoC/SfLwDfOwzxD2BuCdJHXvgezhI/J4ucMk/BDS1dnWKWFHQNte3YnsMsRC6ryhtl45x2Y6fqfjsc9uTzGs5jilFqAFRRTgpsbZ7E+pShvExB+dbc25DXV7r8yWA9ua5AAAA/8+pMamN7acUAAAAAElFTkSuQmCC

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
/* const TargetType = require('../../extension-support/target-type');
const Cast = require('../../util/cast');
const Clone = require('../../util/clone');
const Color = require('../../util/color');
const formatMessage = require('format-message');
const MathUtil = require('../../util/math-util');
const RenderedTarget = require('../../sprites/rendered-target');
const log = require('../../util/log');
const StageLayering = require('../../engine/stage-layering'); */





// Digital Modes
const DIGITAL_INPUT = 1;
const DIGITAL_OUTPUT = 2;
const PWM = 3;
const SERVO = 4;
const TONE = 5;
const SONAR = 6;
const ANALOG_INPUT = 7;

// an array to save the current pin mode
// this is common to all board types since it contains enough
// entries for all the boards.
// Modes are listed above - initialize to invalid mode of -1
let pin_modes = new Array(30).fill(-1);

let alerted = false;        // has an websocket message already been received
let connection_pending = false;
let msg = null;             // general outgoing websocket message holder
let sonar_report_pin = -1;  // the pin assigned to the sonar trigger initially set to -1, an illegal value
let connected = false;      // flag to indicate if the user connected to a board

let digital_inputs = new Array(32); // arrays to hold input values
let analog_inputs = new Array(8);

let connect_attempt = false;// flag to indicate if a websocket connect was ever attempted.
let wait_open = [];         // an array to buffer operations until socket is opened
let the_locale = null;


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

        this.socket = null;
        this.wsUrl = "ws://localhost:8000";

        if (SweetHomeExtension.sprite) {

            SweetHomeExtension.x_Scratch = SweetHomeExtension.sprite.x;
            SweetHomeExtension.y_Scratch = SweetHomeExtension.sprite.y;
            SweetHomeExtension.direction_Scratch = SweetHomeExtension.sprite.direction;

            this.objectlist = SweetHomeExtension.sprite.lookupVariableById("CNn7j*SP0QT%rN4=j[xz");
            this.lamplist = SweetHomeExtension.sprite.lookupVariableById("GoN|030ruZ,{H+4$)C-$");
            SweetHomeExtension.height_SH3D = SweetHomeExtension.sprite.lookupVariableById("9YR=}_qqo.V|FmE2ZCj~");
            SweetHomeExtension.width_SH3D = SweetHomeExtension.sprite.lookupVariableById("Cg-Li`$:dyXAI+Umru~+");

            var clickObjectlist = {};
            for (let o of this.objectlist.value) {
                clickObjectlist[o] = false;
            }
            SweetHomeExtension.clickObjectlist = clickObjectlist;

            this.statusLightlist = {};
            for (let l of this.lamplist.value) {
                this.statusLightlist[l] = "Off";
            }
        }



    }

    getInfo() {
        return {
            id: 'SweetHomeExtension',
            name: 'Sweet Home Extension',
            blocks: this.getBlocks(),
            menus: this.getMenus()
        };
    }

    getBlocks() {
        var typeBlocks = "";
        var result = [
            {
                opcode: 'setColor',
                blockType: BlockType.COMMAND,
                text: 'color the object : [OBJECT] in [COLORLIST]',
                arguments: {
                    OBJECT: {
                        type: ArgumentType.STRING,
                        menu: 'objectMenuBis' //défini plus tard dans : menu
                        //defaultValue : '',
                    },
                    COLORLIST: {
                        type: ArgumentType.STRING,
                        menu: 'colorMenu'
                    }
                }
            }
        ];

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
                                menu: 'objectMenuBis'
                            },
                            COLORLIST: {
                                type: ArgumentType.STRING,
                                menu: 'colorMenu'
                            }
                        }
                    });

                    result.push({
                        opcode: "isObjectClicked",
                        blockType: BlockType.BOOLEAN,
                        text: "[object] est clické ?",
                        arguments: {
                            OBJECT: {
                                type: ArgumentType.STRING,
                                menu: "objectMenuBis"
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
                            "defaultValue": o
                        },
                        COLORLIST: {
                            type: ArgumentType.STRING,
                            "menu": "colorMenu"
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
            switchMenu: {
                acceptReporters: false,
                items: ['turn On', 'turn Off', 'change Statue']
            }
        };

        /* if (this.objectlist && this.objectlist.value.length > 0) {
            result["objectMenu"] = { "items": this.objectlist.value }
        }
        if (this.lamplist && this.lamplist.value.length > 0) {
            result["lampMenu"] = { "items": this.lamplist.value }
        }*/
        return result;
    }

    /* send(text) {
        this.socket.send(text);
    } */

    /* sendPosition(text) {
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
	} */

    connect() {
        // open the connection if one does not exist
/*         if (this.socket !== null
            && this.socket.readyState !== WebSocket.CLOSED) {
            this.sendPosition();
            return;
        } */

        // Create a websocket
        this.socket = new WebSocket(this.wsUrl);

        // change the status to connected if socket is opened
        this.socket.onopen = function (event) {
            SweetHomeExtension.status = "Connected!";
        };

        // get the message from server and treat it
        this.socket.onmessage = function (event) {
            var msgrec = event.data

            // if its a message indicting the current position of Observer Camera
            // then change the variables x_SH3D, y_SH3D and direction_SH3D
            // and move Observer sprite to this position
            if (msgrec.startsWith("position")) {
                var pos = msgrec.split("/")
                SweetHomeExtension.x_SH3D = parseFloat(pos[1]);
                SweetHomeExtension.y_SH3D = parseFloat(pos[2]);
                SweetHomeExtension.direction_SH3D = parseFloat(pos[3]);

                // Change the position Of Observer Sprite if SweetHome3D 
                // indicates automatic in its message
                /* if (SweetHomeExtension.sprite && pos[4]) {

                    // adapt position and direction to match Scratch View
                    var x = -240 + (SweetHomeExtension.x_SH3D + 200) * 480 / (SweetHomeExtension.width_SH3D.value);
                    var y = 180 + (-SweetHomeExtension.y_SH3D + 60) * 360 / (SweetHomeExtension.height_SH3D.value);
                    var direction = (SweetHomeExtension.direction_SH3D * 180 / Math.PI - 90);
                    SweetHomeExtension.sprite.setXY(x, y);
                    SweetHomeExtension.sprite.setDirection(direction);
                } */

                // if its a message indicating what object was clicked
                // then set its value on clickObjectlist to true
            } else if (msgrec.startsWith("click")) {
                var click = msgrec.split("/")
                SweetHomeExtension.clickObjectlist[click[1]] = true;

                //if its a message indicating that it should send position of Observer Sprite 
                // from Scratch to SweetHome3D then set the static variable to true else false
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


        // change the status to connection closed if socket is closed
        this.socket.onclose = function (event) {
            SweetHomeExtension.status = "Connection Closed";
        };
    }


    /* 
    connect() {
        if (connected) {
            // ignore additional connection attempts
            return;
        } else {
            connect_attempt = true;
            //window.socket = new WebSocket("ws://127.0.0.1:9000");
            window.socket = new WebSocket("ws://localhost:8000");
            msg = JSON.stringify({ "id": "to_arduino_gateway" });
        }


        // websocket event handlers
        window.socket.onopen = function () {

            digital_inputs.fill(0);
            analog_inputs.fill(0);
            pin_modes.fill(-1);
            // connection complete
            connected = true;
            connect_attempt = true;
            // the message is built above
            try {
                //ws.send(msg);
                window.socket.send(msg);

            } catch (err) {
                // ignore this exception
            }
            for (let index = 0; index < wait_open.length; index++) {
                let data = wait_open[index];
                data[0](data[1]);
            }
        };

        window.socket.onclose = function () {
            digital_inputs.fill(0);
            analog_inputs.fill(0);
            pin_modes.fill(-1);
            if (alerted === false) {
                alerted = true;
                alert("La connexion WebSocket (SweetHomeExtension) est fermée.");
            }
            connected = false;
        };

        // reporter messages from the board
        window.socket.onmessage = function (message) {
            //msg = JSON.parse(message.data);
            msg = "oui";
            let report_type = msg["report"];
            let pin = null;
            let value = null;

            // types - digital, analog, sonar
            if (report_type === 'digital_input') {
                pin = msg['pin'];
                pin = parseInt(pin, 10);
                value = msg['value'];
                digital_inputs[pin] = value;
            } else if (report_type === 'analog_input') {
                pin = msg['pin'];
                pin = parseInt(pin, 10);
                value = msg['value'];
                analog_inputs[pin] = value;
            } else if (report_type === 'sonar_data') {
                value = msg['value'];
                digital_inputs[sonar_report_pin] = value;
            }
        };
    } */


    setColor({ object, colorList }) {
        this.connect();
        //this.send("setColor/" + object + "/" + colorList);
    }



    /* 
        setColor(args) {
            if (!connected) {
                if (!connection_pending) {
                    this.connect();
                    connection_pending = true;
                }
    
            }
    
            if (!connected) {
                let callbackEntry = [this.setColor.bind(this), args];
                wait_open.push(callbackEntry);
            } else {
                let pin = args['PIN'];
                pin = parseInt(pin, 10);
    
                if (pin_modes[pin] !== DIGITAL_OUTPUT) {
                    pin_modes[pin] = DIGITAL_OUTPUT;
                    msg = { "command": "set_mode_digital_output", "pin": pin };
                    msg = JSON.stringify(msg);
                    window.socket.send(msg);
                }
                let value = args['ON_OFF'];
                value = parseInt(value, 10);
                msg = { "command": "setColor", "pin": pin, "value": value };
                msg = JSON.stringify(msg);
                window.socket.send(msg);
            } */


    /**
    * connect to the server of communication with a WebSocket.
    */
    // connect() {
    // 	// open the connection if one does not exist
    // 	if (this.socket !== null
    // 		&& this.socket.readyState !== WebSocket.CLOSED) {
    // 		return;
    // 	}

    // 	// Create a websocket
    // 	this.socket = new WebSocket(this.wsUrl);

    //     this.socket.onclose = function (event) {
    // 		SweetHomeExtension.status = "Connection Closed";
    // 	};

    // }
}


module.exports = SweetHomeExtension;

/*
if (SweetHomeExtension.sprite) {

SweetHomeExtension.x_Scratch = SweetHomeExtension.sprite.x;
SweetHomeExtension.y_Scratch = SweetHomeExtension.sprite.y;
SweetHomeExtension.direction_Scratch = SweetHomeExtension.sprite.direction;

this.objectlist = SweetHomeExtension.sprite.lookupVariableById("CNn7j*SP0QT%rN4=j[xz");
this.lamplist = SweetHomeExtension.sprite.lookupVariableById("GoN|030ruZ,{H+4$)C-$");
SweetHomeExtension.height_SH3D = SweetHomeExtension.sprite.lookupVariableById("9YR=}_qqo.V|FmE2ZCj~");
SweetHomeExtension.width_SH3D = SweetHomeExtension.sprite.lookupVariableById("Cg-Li`$:dyXAI+Umru~+");

var clickObjectlist = {};
for (let o of this.objectlist.value) {
    clickObjectlist[o] = false;
}
SweetHomeExtension.clickObjectlist = clickObjectlist;

this.statusLightlist = {};
for (let l of this.lamplist.value) {
    this.statusLightlist[l] = "Off";
}

*/

/* 
digital_write(args) {
    if (!connected) {
        if (!connection_pending) {
            this.connect();
            connection_pending = true;
        }

    }

    if (!connected) {
        let callbackEntry = [this.digital_write.bind(this), args];
        wait_open.push(callbackEntry);
    } else {
        let pin = args['PIN'];
        pin = parseInt(pin, 10);

        if (pin_modes[pin] !== DIGITAL_OUTPUT) {
            pin_modes[pin] = DIGITAL_OUTPUT;
            msg = {"command": "set_mode_digital_output", "pin": pin};
            msg = JSON.stringify(msg);
            window.socket.send(msg);
        }
        let value = args['ON_OFF'];
        value = parseInt(value, 10);
        msg = {"command": "digital_write", "pin": pin, "value": value};
        msg = JSON.stringify(msg);
        window.socket.send(msg);
    }
}
*/

/* 
// if user opened the file SB3 generated by SweetHome3D's plugin 
// then look up for typeBlocks variable to create scrolling menu blocks or simple blocks
if (SweetHomeExtension.sprite) {
    typeBlocks = SweetHomeExtension.sprite.lookupVariableById("L^i{fNhE#uQ8.g=D;O~O");
    if (typeBlocks && typeBlocks.value.startsWith("m")) {
        result = [];
        if (this.objectlist.value.length > 0) {
            result.push({
                "opcode": "setColor",
                "blockType": "command",
                "text": "colorer [object] en [colorList] ",
                "arguments": {
                    "object": {
                        "type": "string",
                        "menu": "objectMenu"
                    },
                    "colorList": {
                        "type": "string",
                        "menu": "colorMenu"
                    }
                }
            });

            result.push({
                "opcode": "isObjectClicked",
                blockType: BlockType.BOOLEAN,
                "text": "[object] est clické ?",
                "arguments": {
                    "object": {
                        "type": "string",
                        "menu": "objectMenu"
                    }
                }
            });
        }
    }
} */

/* 
if (typeBlocks && typeBlocks.value.startsWith("b")) {
    result = [];
    for (let o of this.objectlist.value) {
        result.push({
            "opcode": "setColor",
            "blockType": "command",
            "text": "colorer [object] en [colorList]",
            "arguments": {
                "object": {
                    "type": "string",
                    "defaultValue": o
                },
                "colorList": {
                    "type": "string",
                    "menu": "colorMenu"
                }
            }
        });
    }
} */