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
    static objectlist =[];
    static lamplist = [];


    constructor(runtime) {
        this.runtime = runtime;

        this.socket = null;
        this.wsUrl = "ws://localhost:8000";
        SweetHomeExtension.sprite = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAn1BMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKCgoKCgoAAAAAAAAAAAAAAAAAAAAUFBQUFBQAAAAODg4AAAAAAAAQEBAAAAAcHBwAAAAbGxsbGxsZGRkaGhpAQEAZGRkuLi4uLi5paWkjIyOOjo4oKCh9fX2Hh4cvLy87OzuBgYGKioqampqhoaGxsbHHx8fW1tbd3d3w8PD39/f///++xlGHAAAAKHRSTlMACgwRGhsfIScxMklRUlVWWltrcIiJn7W4xM/Z39/n6enq8/f8/f7+MmotOAAAAAFiS0dENKmx6f0AAACOSURBVBgZBcFHcsJAEADAnmElKIFDyb7w//f5YIMCSutuAACUBoCmSKUHoC/SfLwDfOwzxD2BuCdJHXvgezhI/J4ucMk/BDS1dnWKWFHQNte3YnsMsRC6ryhtl45x2Y6fqfjsc9uTzGs5jilFqAFRRTgpsbZ7E+pShvExB+dbc25DXV7r8yWA9ua5AAAA/8+pMamN7acUAAAAAElFTkSuQmCC";
        //SweetHomeExtension.sprite = this.runtime.getSpriteTargetByName("Observer");

        if (SweetHomeExtension.sprite) {
            alert("La condition ''if (SweetHomeExtension.sprite)'' est respecté");

            SweetHomeExtension.x_Scratch = SweetHomeExtension.sprite.x;
            SweetHomeExtension.y_Scratch = SweetHomeExtension.sprite.y;
            SweetHomeExtension.direction_Scratch = SweetHomeExtension.sprite.direction;

            SweetHomeExtension.height_SH3D = SweetHomeExtension.sprite;
            SweetHomeExtension.width_SH3D = SweetHomeExtension.sprite;

            // this.objectlist = SweetHomeExtension.sprite.lookupVariableById("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAn1BMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKCgoKCgoAAAAAAAAAAAAAAAAAAAAUFBQUFBQAAAAODg4AAAAAAAAQEBAAAAAcHBwAAAAbGxsbGxsZGRkaGhpAQEAZGRkuLi4uLi5paWkjIyOOjo4oKCh9fX2Hh4cvLy87OzuBgYGKioqampqhoaGxsbHHx8fW1tbd3d3w8PD39/f///++xlGHAAAAKHRSTlMACgwRGhsfIScxMklRUlVWWltrcIiJn7W4xM/Z39/n6enq8/f8/f7+MmotOAAAAAFiS0dENKmx6f0AAACOSURBVBgZBcFHcsJAEADAnmElKIFDyb7w//f5YIMCSutuAACUBoCmSKUHoC/SfLwDfOwzxD2BuCdJHXvgezhI/J4ucMk/BDS1dnWKWFHQNte3YnsMsRC6ryhtl45x2Y6fqfjsc9uTzGs5jilFqAFRRTgpsbZ7E+pShvExB+dbc25DXV7r8yWA9ua5AAAA/8+pMamN7acUAAAAAElFTkSuQmCC");
            // this.lamplist = SweetHomeExtension.sprite.lookupVariableById("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAn1BMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKCgoKCgoAAAAAAAAAAAAAAAAAAAAUFBQUFBQAAAAODg4AAAAAAAAQEBAAAAAcHBwAAAAbGxsbGxsZGRkaGhpAQEAZGRkuLi4uLi5paWkjIyOOjo4oKCh9fX2Hh4cvLy87OzuBgYGKioqampqhoaGxsbHHx8fW1tbd3d3w8PD39/f///++xlGHAAAAKHRSTlMACgwRGhsfIScxMklRUlVWWltrcIiJn7W4xM/Z39/n6enq8/f8/f7+MmotOAAAAAFiS0dENKmx6f0AAACOSURBVBgZBcFHcsJAEADAnmElKIFDyb7w//f5YIMCSutuAACUBoCmSKUHoC/SfLwDfOwzxD2BuCdJHXvgezhI/J4ucMk/BDS1dnWKWFHQNte3YnsMsRC6ryhtl45x2Y6fqfjsc9uTzGs5jilFqAFRRTgpsbZ7E+pShvExB+dbc25DXV7r8yWA9ua5AAAA/8+pMamN7acUAAAAAElFTkSuQmCC");
            // SweetHomeExtension.height_SH3D = SweetHomeExtension.sprite.lookupVariableById("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAn1BMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKCgoKCgoAAAAAAAAAAAAAAAAAAAAUFBQUFBQAAAAODg4AAAAAAAAQEBAAAAAcHBwAAAAbGxsbGxsZGRkaGhpAQEAZGRkuLi4uLi5paWkjIyOOjo4oKCh9fX2Hh4cvLy87OzuBgYGKioqampqhoaGxsbHHx8fW1tbd3d3w8PD39/f///++xlGHAAAAKHRSTlMACgwRGhsfIScxMklRUlVWWltrcIiJn7W4xM/Z39/n6enq8/f8/f7+MmotOAAAAAFiS0dENKmx6f0AAACOSURBVBgZBcFHcsJAEADAnmElKIFDyb7w//f5YIMCSutuAACUBoCmSKUHoC/SfLwDfOwzxD2BuCdJHXvgezhI/J4ucMk/BDS1dnWKWFHQNte3YnsMsRC6ryhtl45x2Y6fqfjsc9uTzGs5jilFqAFRRTgpsbZ7E+pShvExB+dbc25DXV7r8yWA9ua5AAAA/8+pMamN7acUAAAAAElFTkSuQmCC");
            // SweetHomeExtension.width_SH3D = SweetHomeExtension.sprite.lookupVariableById("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAn1BMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKCgoKCgoAAAAAAAAAAAAAAAAAAAAUFBQUFBQAAAAODg4AAAAAAAAQEBAAAAAcHBwAAAAbGxsbGxsZGRkaGhpAQEAZGRkuLi4uLi5paWkjIyOOjo4oKCh9fX2Hh4cvLy87OzuBgYGKioqampqhoaGxsbHHx8fW1tbd3d3w8PD39/f///++xlGHAAAAKHRSTlMACgwRGhsfIScxMklRUlVWWltrcIiJn7W4xM/Z39/n6enq8/f8/f7+MmotOAAAAAFiS0dENKmx6f0AAACOSURBVBgZBcFHcsJAEADAnmElKIFDyb7w//f5YIMCSutuAACUBoCmSKUHoC/SfLwDfOwzxD2BuCdJHXvgezhI/J4ucMk/BDS1dnWKWFHQNte3YnsMsRC6ryhtl45x2Y6fqfjsc9uTzGs5jilFqAFRRTgpsbZ7E+pShvExB+dbc25DXV7r8yWA9ua5AAAA/8+pMamN7acUAAAAAElFTkSuQmCC");


            var clickObjectlist = {};
            // for (let o of this.objectlist.value) {
            //     clickObjectlist[o] = false;
            // }
            SweetHomeExtension.clickObjectlist = clickObjectlist;

            this.statusLightlist = {};
            // for (let l of this.lamplist.value) {
            //     this.statusLightlist[l] = "Off";
            // }
        }
        //ajout
        else{
            alert("La condition ''if (SweetHomeExtension.sprite)'' n'est pas respecté");
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
        return result;
    }




    setColor() {
    }
}


module.exports = SweetHomeExtension;