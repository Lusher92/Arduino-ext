/*
This is the Scratch 3 extension to remotely control an
Arduino Uno, ESP-8666, or Raspberry Pi


 Copyright (c) 2019 Alan Yorinks All rights reserved.

 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 Version 3 as published by the Free Software Foundation; either
 or (at your option) any later version.
 This library is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 General Public License for more details.

 You should have received a copy of the GNU AFFERO GENERAL PUBLIC LICENSE
 along with this library; if not, write to the Free Software
 Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 */

// Boiler plate from the Scratch Team
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');


// The following are constants used within the extension

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


class Scratch3ArduinoOneGPIO {
    constructor(runtime) {
        this.runtime = runtime;
    }

    getInfo() {
        this.connect();

        return {
            id: 'onegpioArduino',
            color1: '#0C5986',
            color2: '#34B0F7',
            name: 'OneGpio Arduino',
            blockIconURI: 'data:image/png;base64,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',
            blocks: [
                {
                    opcode: 'setColor',
                    blockType: BlockType.COMMAND,
                    text: 'color the object : [OBJECT] in [COLORLIST]',
                    arguments: {
                        OBJECT: {
                            type: ArgumentType.STRING,
                            defaultValue : 'OBJECT_1',
                            menu: 'objectMenuBis' //défini plus tard dans : menu
                            //defaultValue : '',
                        },
                        COLORLIST: {
                            type: ArgumentType.STRING,
                            defaultValue : 'noir',
                            menu: 'colorMenu'
                        }
                    }
                }
            ],
            menus: {
                objectMenuBis: {
                    acceptReporters: true,
                    items: ['OBJECT_1', 'OBJECT_2', 'OBJECT_3']
                },
                colorMenu: {
                    items: ["noir", "bleu", "cyan", "gris", "vert",
                        "magenta", "rouge", "blanc", "jaune"]
                },
            }
        };
    }

    // The block handlers

    // command blocks

    setColor() {
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
    }
}

module.exports = Scratch3ArduinoOneGPIO;
