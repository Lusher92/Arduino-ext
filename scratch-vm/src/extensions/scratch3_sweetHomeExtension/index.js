
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

/** PLan de code
 * 
 * On ne vas créer de nouveau block mais on vas push dans le menu
 */

// croix noir : data:image/png;base64,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
// observer : data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAn1BMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKCgoKCgoAAAAAAAAAAAAAAAAAAAAUFBQUFBQAAAAODg4AAAAAAAAQEBAAAAAcHBwAAAAbGxsbGxsZGRkaGhpAQEAZGRkuLi4uLi5paWkjIyOOjo4oKCh9fX2Hh4cvLy87OzuBgYGKioqampqhoaGxsbHHx8fW1tbd3d3w8PD39/f///++xlGHAAAAKHRSTlMACgwRGhsfIScxMklRUlVWWltrcIiJn7W4xM/Z39/n6enq8/f8/f7+MmotOAAAAAFiS0dENKmx6f0AAACOSURBVBgZBcFHcsJAEADAnmElKIFDyb7w//f5YIMCSutuAACUBoCmSKUHoC/SfLwDfOwzxD2BuCdJHXvgezhI/J4ucMk/BDS1dnWKWFHQNte3YnsMsRC6ryhtl45x2Y6fqfjsc9uTzGs5jilFqAFRRTgpsbZ7E+pShvExB+dbc25DXV7r8yWA9ua5AAAA/8+pMamN7acUAAAAAElFTkSuQmCC

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const log = require('../../util/log');



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
        SweetHomeExtension.sprite = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAn1BMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKCgoKCgoAAAAAAAAAAAAAAAAAAAAUFBQUFBQAAAAODg4AAAAAAAAQEBAAAAAcHBwAAAAbGxsbGxsZGRkaGhpAQEAZGRkuLi4uLi5paWkjIyOOjo4oKCh9fX2Hh4cvLy87OzuBgYGKioqampqhoaGxsbHHx8fW1tbd3d3w8PD39/f///++xlGHAAAAKHRSTlMACgwRGhsfIScxMklRUlVWWltrcIiJn7W4xM/Z39/n6enq8/f8/f7+MmotOAAAAAFiS0dENKmx6f0AAACOSURBVBgZBcFHcsJAEADAnmElKIFDyb7w//f5YIMCSutuAACUBoCmSKUHoC/SfLwDfOwzxD2BuCdJHXvgezhI/J4ucMk/BDS1dnWKWFHQNte3YnsMsRC6ryhtl45x2Y6fqfjsc9uTzGs5jilFqAFRRTgpsbZ7E+pShvExB+dbc25DXV7r8yWA9ua5AAAA/8+pMamN7acUAAAAAElFTkSuQmCC";
        SweetHomeExtension.automatic = false;


        if (SweetHomeExtension.sprite) {

            // initialize x,y and direction of Observer sprite with its current position
            SweetHomeExtension.x_Scratch = SweetHomeExtension.sprite.x;
            SweetHomeExtension.y_Scratch = SweetHomeExtension.sprite.y;
            SweetHomeExtension.direction_Scratch = SweetHomeExtension.sprite.direction;


            this.objectlist = "data:image/png;base64,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";
            this.lamplist = "data:image/png;base64,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";

            SweetHomeExtension.height_SH3D = "data:image/png;base64,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";
            SweetHomeExtension.width_SH3D = "data:image/png;base64,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";



            // initialize the static variable clickObjectlist of SweetHomeExtension class
            // with a Map of objects (String) as keys and boolean as value to indicate
            // if an object was clicked on SweetHome3D or not.

            /*
            var clickObjectlist = {};
            for (let o of this.objectlist.value) { clickObjectlist[o] = false; }

            SweetHomeExtension.clickObjectlist = clickObjectlist;

            // Create a list of lights with their status (On or Off)
            this.statusLightlist = {};
            for (let l of this.lamplist.value) { this.statusLightlist[l] = "Off"; }
            */

        }

    }

    getInfo() {
        /*
        the_locale = this._setLocale();
        this.connect();
        */
        return {
            id: 'SweetHomeExtension',
            name: 'Sweet Home Extension',
            blocks: [
                {
                    opcode: 'setColor',
                    blockType: BlockType.COMMAND,
                    text: 'color the object : [OBJECT] in [COLORLIST]',
                    arguments: {
                        OBJECT: {
                            type: ArgumentType.STRING,
                            menu: 'objectMenu' //défini plus tard dans : menu
                        },
                        COLORLIST: {
                            type: ArgumentType.STRING,
                            menu: 'colorMenu'
                        }
                    }
                },
                {
                    opcode: 'resetColor',
                    blockType: BlockType.COMMAND,
                    text: 'reset the color of [OBJECT]',
                    arguments: {
                        OBJECT: {
                            type: ArgumentType.STRING,
                            menu: 'objectMenu' //défini plus tard dans : menu
                        }
                    }
                },
                {
                    opcode: 'switchOnOff',
                    blockType: BlockType.COMMAND,
                    text: '[SWITCHLIST] the [OBJECT]',
                    arguments: {
                        SWITCHLIST: {
                            type: ArgumentType.STRING,
                            menu: 'switchMenu'
                        },
                        OBJECT: {
                            type: ArgumentType.STRING,
                            menu: 'objectMenu' //défini plus tard dans : menu
                        }
                    }
                },
                {
                    opcode: 'getMassage',
                    blockType: "reporter",
                    text: 'message'
                },
                {
                    opcode: 'getStatue',
                    blockType: "reporter",
                    text: 'statue'
                },
                {
                    opcode: 'getX_SH3D',
                    blockType: "reporter",
                    text: 'x_SH3D'
                },
                {
                    opcode: 'getY_SH3D',
                    blockType: "reporter",
                    text: 'Y_SH3D'
                },
                {
                    opcode: 'getGirection_SH3D',
                    blockType: "reporter",
                    text: 'direction_SH3D'
                },
            ],
            menus: {
                objectMenu: {
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
            }
        };
    }

    resetColor({object}) {
        this.connect();
        this.send("reset/" + object);
    }

    connect(){}

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

	setColor({ object, colorList }) {
		this.connect();
		this.send("setColor/" + object + "/" + colorList);
	}

    switchOnOff({ switchList, lamp }) {
		this.connect();
		var result = "switchOnOff/";
		if (switchList.startsWith("C")) {
			if (this.statusLightlist[lamp].startsWith("On")) {
				result = result + "Eteindre/";
				this.statusLightlist[lamp] = "Off";
			} else {
				result = result + "Allumer/";
				this.statusLightlist[lamp] = "On";
			}
		} else {
			result = result + switchList + "/";
			if (switchList.startsWith("A")) {
				this.statusLightlist[lamp] = "On";
			} else {
				this.statusLightlist[lamp] = "Off";
			}
		}
		result = result + lamp;
		this.send(result);
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






/*
writeLog (args) {
    const text = Cast.toString(args.TEXT);
    log.log(text);
}
*/
}

/* (function () {
	var extensionClass = SweetHomeExtension
	if (typeof window === "undefined" || !window.vm) {
		Scratch.extensions.register(new extensionClass())
	}
	else {
		var extensionInstance = new extensionClass(window.vm.extensionManager.runtime)
		var serviceName = window.vm.extensionManager._registerInternalExtension(extensionInstance)
		window.vm.extensionManager._loadedExtensions.set(extensionInstance.getInfo().id, serviceName)
	}
})()
 */


module.exports = SweetHomeExtension;