
/* @author Guillaume DOEUVRE
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
        SweetHomeExtension.sprite = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTZweCIgaGVpZ2h0PSIxNnB4IiB2aWV3Qm94PSIwIDAgMTYgMTYiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+dnVlM0QvdmlldzNkLW1vZGlmeS1vYnNlcnZlcjwvdGl0bGU+CiAgICA8ZyBpZD0idnVlM0QvdmlldzNkLW1vZGlmeS1vYnNlcnZlciIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9Ikdyb3VwIiBmaWxsPSIjREREREREIiBmaWxsLXJ1bGU9Im5vbnplcm8iIG9wYWNpdHk9IjAiPgogICAgICAgICAgICA8ZyBpZD0iUmVjdGFuZ2xlLUNvcHktMjUiPgogICAgICAgICAgICAgICAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2Ij48L3JlY3Q+CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICAgICAgPGcgaWQ9Ikdyb3VwLTMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEuNTAwMDAwLCAxLjEwMDAwMCkiIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMC43NSI+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0xLjQ3ODk3MTMzLDguMjQ5NzEyNTQgTDUuOTk5NDI1MDksNy40ODQ3MTI2OCBDNi4zMzA3ODU5OCw3LjQyODYzNjIyIDYuNjY5MjE0MDIsNy40Mjg2MzYyMiA3LjAwMDU3NDkxLDcuNDg0NzEyNjggTDExLjUyMTAyODcsOC4yNDk3MTI1NCBDMTIuMzc0OTg3Niw4LjM5NDIyODY3IDEzLDkuMTMzODk5MTIgMTMsMTAgQzEzLDEwLjg3NTEzODIgMTIuMzg5MTQ2NSwxMS42MzE1Njg1IDExLjUzMzYyNzMsMTEuODE1ODM0MSBMNy4xMzE2NjgyMywxMi43NjM5NDg0IEM2LjcxNTMyOTg4LDEyLjg1MzYyMTMgNi4yODQ2NzAxMiwxMi44NTM2MjEzIDUuODY4MzMxNzcsMTIuNzYzOTQ4NCBMMS40NjYzNzI2NywxMS44MTU4MzQxIEMwLjYxMDg1MzUyOCwxMS42MzE1Njg1IDQuOTU4MTI5NDJlLTE2LDEwLjg3NTEzODIgMCwxMCBDLTEuMDYwNjY3NjdlLTE2LDkuMTMzODk5MTIgMC42MjUwMTI0MTQsOC4zOTQyMjg2NyAxLjQ3ODk3MTMzLDguMjQ5NzEyNTQgWiIgaWQ9IlJlY3RhbmdsZSIgZmlsbD0iI0RERERERCI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNNi41LDEyLjkgQzguNSwxMi45IDkuNSwxMS4zODA3MTE5IDkuNSwxMCBDOS41LDguNjE5Mjg4MTMgOC41LDYuOSA2LjUsNi45IEM0LjUsNi45IDMuNSw4LjYxOTI4ODEzIDMuNSwxMCBDMy41LDExLjM4MDcxMTkgNC41LDEyLjkgNi41LDEyLjkgWiIgaWQ9Ik92YWwiIGZpbGw9IiNGRkZGRkYiPjwvcGF0aD4KICAgICAgICAgICAgPHBhdGggZD0iTTAuNSwwLjkgTDMuNSw1LjkgTTkuNSw1LjkgTDEyLjUsMC45IiBpZD0iU2hhcGUiPjwvcGF0aD4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==';
        SweetHomeExtension.automatic = false;


        if (SweetHomeExtension.sprite) {

            // initialize x,y and direction of Observer sprite with its current position
            SweetHomeExtension.x_Scratch = SweetHomeExtension.sprite.x;
            SweetHomeExtension.y_Scratch = SweetHomeExtension.sprite.y;
            SweetHomeExtension.direction_Scratch = SweetHomeExtension.sprite.direction;


            this.objectlist = SweetHomeExtension.sprite.lookupVariableById("CNn7j*SP0QT%rN4=j[xz");
            this.lamplist = SweetHomeExtension.sprite.lookupVariableById("GoN|030ruZ,{H+4$)C-$");

            SweetHomeExtension.height_SH3D = SweetHomeExtension.sprite.lookupVariableById("9YR=}_qqo.V|FmE2ZCj~");
            SweetHomeExtension.width_SH3D = SweetHomeExtension.sprite.lookupVariableById("Cg-Li`$:dyXAI+Umru~+");



            // initialize the static variable clickObjectlist of SweetHomeExtension class
            // with a Map of objects (String) as keys and boolean as value to indicate
            // if an object was clicked on SweetHome3D or not.
            var clickObjectlist = {};
            for (let o of this.objectlist.value) { clickObjectlist[o] = false; }

            SweetHomeExtension.clickObjectlist = clickObjectlist;

            // Create a list of lights with their status (On or Off)
            this.statusLightlist = {};
            for (let l of this.lamplist.value) { this.statusLightlist[l] = "Off"; }

        }

    }

    getInfo() {
        return {
            "id": "SweetHomeExtension",
            "name": "SweetHomeExtension",
            "blocks": this.getBlocks(),
            "menus": this.getMenus()
        };
    }

    /**
     * @returns {Array} of blocks for SweetHomeExtension extension.
     */
    getBlocks() {
        var typeBlocks = "";
        // initialize result with 3 simple blocks with object and light empty
        var result = [{
            opcode: 'setColor',
            blockType: BlockType.COMMAND,
            text: "colorer [object] en [colorList] ",
            arguments: {
                object: {
                    type: ArgumentType.STRING,
                    defaultValue: ""
                },
                colorList: {
                    type: ArgumentType.STRING,
                    menu: 'colorMenu'
                }
            }
        }, {
            opcode: 'reSet',
            blockType: BlockType.COMMAND,
            text: 'reset the color of [object]',
            arguments: {
                object: {
                    type: ArgumentType.STRING,
                    defaultValue: ""
                }
            }
        }, {
            opcode: 'switchOnOff',
            blockType: BlockType.COMMAND,
            text: '[switchList] the [lamp]',
            arguments: {
                switchList: {
                    type: ArgumentType.STRING,
                    menu: 'switchMenu'
                },
                lamp: {
                    type: ArgumentType.STRING,
                    defaultValue: ""
                }
            }
        }
        ];

        // if user opened the file SB3 generated by SweetHome3D's plugin 
        // then look up for typeBlocks variable to create scrolling menu blocks or simple blocks
        if (SweetHomeExtension.sprite) {
            typeBlocks = SweetHomeExtension.sprite.lookupVariableById("L^i{fNhE#uQ8.g=D;O~O");
            if (typeBlocks && typeBlocks.value.startsWith("m")) {
                result = [];
                if (this.objectlist.value.length > 0) {
                    result.push(
                        {
                            opcode: 'setColor',
                            blockType: BlockType.COMMAND,
                            text: "color the [object] in [colorList] ",
                            arguments: {
                                object: {
                                    type: ArgumentType.STRING,
                                    menu: 'objectMenu'
                                },
                                colorList: {
                                    type: ArgumentType.STRING,
                                    menu: 'colorMenu'
                                }
                            }
                        }
                    );
                    result.push(
                        {
                            opcode: 'reSet',
                            blockType: BlockType.COMMAND,
                            text: 'reset the color of [OBJECT]',
                            arguments: {
                                object: {
                                    type: ArgumentType.STRING,
                                    menu: 'objectMenu' //défini plus tard dans : menu
                                }
                            }
                        }
                    );
                    result.push(
                        {
                            opcode: "isObjectClicked",
                            blockType: BlockType.BOOLEAN,
                            text: "[object] est clické ?",
                            arguments: {
                                object: {
                                    type: ArgumentType.STRING,
                                    menu: 'objectMenu'
                                }
                            }
                        }
                    );
                }
                if (this.lamplist.value.length > 0) {
                    result.push(
                        {
                            opcode: 'switchOnOff',
                            blockType: BlockType.COMMAND,
                            text: '[switchList] the [lamp]',
                            arguments: {
                                switchList: {
                                    type: ArgumentType.STRING,
                                    menu: 'switchMenu'
                                },
                                lamp: {
                                    type: ArgumentType.STRING,
                                    menu: 'lampMenu' //défini plus tard dans : menu
                                }
                            }
                        }
                    );
                }
            }
        }

        if (typeBlocks && typeBlocks.value.startsWith("b")) {
            result = [];
            for (let o of this.objectlist.value) {
                result.push(
                    {
                        opcode: 'setColor',
                        blockType: BlockType.COMMAND,
                        text: "colorer [object] en [colorList] ",
                        arguments: {
                            object: {
                                type: ArgumentType.STRING,
                                defaultValue: o //??????
                            },
                            colorList: {
                                type: ArgumentType.STRING,
                                menu: 'colorMenu'
                            }
                        }
                    }
                );
            }
            for (let l of this.lamplist.value) {
                result.push(
                    {
                        opcode: 'switchOnOff',
                        blockType: BlockType.COMMAND,
                        text: '[switchList] the [lamp]',
                        arguments: {
                            switchList: {
                                type: ArgumentType.STRING,
                                menu: 'switchMenu'
                            },
                            lamp: {
                                type: ArgumentType.STRING,
                                defaultValue: l
                            }
                        }
                    }
                );
            }
        }

        for (let o of this.objectlist.value) {
            result.push(
                {
                    opcode: 'reSet',
                    blockType: BlockType.COMMAND,
                    text: 'reset the color of [object]',
                    arguments: {
                        object: {
                            type: ArgumentType.STRING,
                            defaultValue: o
                        }
                    }
                }
            );
        }

        // create sensing blocks for every object
        if (this.objectlist && this.objectlist.value.length > 0) {
            for (let o of this.objectlist.value) {
                result.push({
                    opcode: "isObjectClicked",
                    blockType: BlockType.BOOLEAN,
                    text: "[object] est clické ?",
                    arguments: {
                        object: {
                            type: ArgumentType.STRING,
                            defaultValue: o
                        }
                    }
                });
            }
        }

        // add the variables : message, status,x_SH3D,y_SH3D and direction_SH3D
        result.push(
            {
                opcode : 'getMassage',
                blockType : "reporter",
                text : 'message'
            });
        result.push(
            {
                opcode : 'getStatue',
                blockType : "reporter",
                text : 'statue'
            });
        result.push(
            {
                opcode : 'getX_SH3D',
                blockType : "reporter",
                text : 'x_SH3D'
            });
        result.push(
            {
                opcode : 'getY_SH3D',
                blockType : "reporter",
                text : 'Y_SH3D'
            });
        result.push(
            {
                opcode : 'getGirection_SH3D',
                blockType : "reporter",
                text : 'direction_SH3D'
            });
        return result;
    }

    /**
   * @returns {Array} of menus for SweetHomeExtension extension.
   */
    getMenus() {
        var objectMenu = [];
        var lampMenu = [];

        // add colors menu and switch On/Off menu
        var result = {
            "colorMenu": {
                "items": ["noir", "bleu", "cyan", "gris", "vert", "magenta", "rouge", "blanc", "jaune"]
            },
            "switchMenu": {
                "items": ["Allumer", "Eteindre", "Changer Etat"]
            }
        };

        // add menu of objects and lights
        if (this.objectlist && this.objectlist.value.length > 0) {
            result["objectMenu"] = { "items": this.objectlist.value }
        }
        if (this.lamplist && this.lamplist.value.length > 0) {
            result["lampMenu"] = { "items": this.lamplist.value }
        }
        return result;
    }
}
/*
writeLog (args) {
    const text = Cast.toString(args.TEXT);
    log.log(text);
}
*/

module.exports = SweetHomeExtension;