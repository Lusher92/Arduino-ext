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


// The following are constants used within the extension



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
        if (SweetHomeExtension.sprite){
            alert("sweetHomeExtension.sprite ok !")
        } else {
            alert("SweetHomeExtension.sprite ne marche pas!")
        }
    }

    getInfo() {
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
                            menu: 'objectMenuBis' //défini plus tard dans : menu
                            //defaultValue : '',
                        },
                        COLORLIST: {
                            type: ArgumentType.STRING,
                            defaultValue: 'noir',
                            menu: 'colorMenu'
                        }
                    }
                }];
        return result;
    }

    getMenus() {
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
        return result;

    }


    // The block handlers

    // command blocks

    setColor(args) {
        if (!connected) {
            if (!connection_pending) {
                this.connect();
                connection_pending = true;
            }
        }
        // window.socket.send("setColor/" + object + "/" + colorList);
    }

    // helpers
    connect() {
        if (connected) {
            // ignore additional connection attempts
            return;
        } else {
            connect_attempt = true;
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
                //alerted = true;
                alert("Connection fermé");
            }
            connected = false;
        };

        // reporter messages from the board
        window.socket.onmessage = function (message) {
            msg = JSON.parse(message.data);
            let report_type = msg["CNn7j*SP0QT%rN4=j[xz"];

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
}

module.exports = SweetHomeExtension;
