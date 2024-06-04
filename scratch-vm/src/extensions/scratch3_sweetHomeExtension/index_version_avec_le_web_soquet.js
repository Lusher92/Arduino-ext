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
// const TargetType = require('../../extension-support/target-type');
// const Cast = require('../../util/cast');
// const Clone = require('../../util/clone');
// const Color = require('../../util/color');
// const formatMessage = require('format-message');
// const MathUtil = require('../../util/math-util');
// const RenderedTarget = require('../../sprites/rendered-target');
// const log = require('../../util/log');
// const StageLayering = require('../../engine/stage-layering');


// an array to save the current pin mode
// this is common to all board types since it contains enough
// entries for all the boards.
// Modes are listed above - initialize to invalid mode of -1
let pin_modes = new Array(30).fill(-1);

// has an websocket message already been received
let alerted = false;

let connection_pending = false;

// general outgoing websocket message holder
let msg = null;

// the pin assigned to the sonar trigger
// initially set to -1, an illegal value
let sonar_report_pin = -1;

// flag to indicate if the user connected to a board
let connected = false;

// arrays to hold input values
let digital_inputs = new Array(32);
let analog_inputs = new Array(8);

// flag to indicate if a websocket connect was
// ever attempted.
let connect_attempt = false;

// an array to buffer operations until socket is opened
let wait_open = [];

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

    connect() {
        if (connected) {
            // ignore additional connection attempts
            return;
        } else {
            connect_attempt = true;
            //window.socket = new WebSocket("ws://127.0.0.1:9000");
            window.socket = new WebSocket("ws://localhost:8000");
            msg = JSON.stringify({"id": "to_arduino_gateway"});
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
                alert("La connexion WebSocket (ScratchHome) est fermée.");}
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
            }

    /* setColor(args) {
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
                msg = {"command": "set_mode_digital_output", "pin": pin};
                msg = JSON.stringify(msg);
                window.socket.send(msg);
            }
            let value = args['ON_OFF'];
            value = parseInt(value, 10);
            msg = {"command": "setColor", "pin": pin, "value": value};
            msg = JSON.stringify(msg);
            window.socket.send(msg);
        }
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
	// 		ScratchHome.status = "Connection Closed";
	// 	};

    // }
 }


module.exports = SweetHomeExtension;

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