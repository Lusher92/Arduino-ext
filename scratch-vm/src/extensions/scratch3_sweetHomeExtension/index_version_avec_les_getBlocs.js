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
// const TargetType = require('../../extension-support/target-type');
// const Cast = require('../../util/cast');
// const Clone = require('../../util/clone');
// const Color = require('../../util/color');
// const formatMessage = require('format-message');
// const MathUtil = require('../../util/math-util');
// const RenderedTarget = require('../../sprites/rendered-target');
// const log = require('../../util/log');
// const StageLayering = require('../../engine/stage-layering');



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

        if (this.objectlist && this.objectlist.value.length > 0) {
            result["objectMenu"] = { "items": this.objectlist.value }
        }
        if (this.lamplist && this.lamplist.value.length > 0) {
            result["lampMenu"] = { "items": this.lamplist.value }
        }
        return result;
    }

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