/**
   * Class for the ScratchHome Extension in Scratch 3.0
  */
class ScratchHome {

	/** The last message received from SweetHome3D 
	 * @type {String}
	 * @static.
	 */
	static message = "empty";

	/** The status of the connection to server communicating between Scratch3 and SweetHome3D 
	 * @type {String}
	 * @static.
	 */
	static status = "empty";

	/** The absces of Observer Sprite on Scratch 
	 * @type {int}
	 * @static.
	 */
	static x_Scratch = 0;

	/** The ordinate of Observer Sprite on Scratch 
	 * @type {int}
	 * @static.
	 */
	static y_Scratch = 0;

	/** The direction of Observer Sprite on Scratch  
	 * @type {int}
	 * @static.
	 */
	static direction_Scratch = 0;

	/** The absces of Observer Camera on SweetHome3D 
	* @type {int}
	* @static.
	*/
	static x_SH3D = 0;

	/** The ordinate of Observer Camera on SweetHome3D 
	 * @type {int}
	 * @static.
	 */
	static y_SH3D = 0;

	/** The direction of Observer Camera on SweetHome3D 
	 * @type {int}
	 * @static.
	 */
	static direction_SH3D = 0;

	/** a boolean indicating if Scratch sends position of Observer sprite
	 * to SweetHome3D automatically or not
	 * @type {Boolean}
	 * @static.
	 */
	static automatic = undefined;

	/** The sprite of Observer Camera 
	 * @type {Target}
	 * @static.
	 */
	static sprite = undefined;

	/** The map of objects and booleans indicating if an object is clicked on SweetHome3D
	 * @type {Map{String,boolean}}
	 * @static.
	 */
	static clickObjectlist = undefined;

	/**
		* @param {Runtime} runtime - the runtime instantiating this block package.
		* @constructor
		*/
	constructor(runtime) {
		/**
	   * The runtime instantiating this block package.
	   * @type {Runtime}
	*/
		this.runtime = runtime;

		/**
		   * The WebSocket used to communicate with SweetHome3D .
		   * @type {WebSocket}
		   * @private 
		   */
		this.socket = null;

		/**
		  * The WebSocketUrl used to instanciate socket .
		  * @type {WebSocket}
		  * @private 
		*/
		this.wsUrl = "ws://localhost:8000";

		// initialize the static variable sprite of ScratchHome class
		// with the target Sprite named Observer
		ScratchHome.sprite = this.runtime.getSpriteTargetByName("Observer");

		// set the static variable automatic to false
		ScratchHome.automatic = false;

		if (ScratchHome.sprite) {

			// initialize x,y and direction of Observer sprite with its current position
			ScratchHome.x_Scratch = ScratchHome.sprite.x;
			ScratchHome.y_Scratch = ScratchHome.sprite.y;
			ScratchHome.direction_Scratch = ScratchHome.sprite.direction;

			/**
			  * The Array list of objects got from sprite.
			  * @type {Array}
			  * @private 
			 */
			this.objectlist = ScratchHome.sprite.lookupVariableById("CNn7j*SP0QT%rN4=j[xz");

			/**
			  * The Array list of lights got from sprite.
			  * @type {Array}
			  * @private 
			 */
			this.lamplist = ScratchHome.sprite.lookupVariableById("GoN|030ruZ,{H+4$)C-$");

			/**
			 * The height of SH3D's SVG file got from sprite.
			 * @type {int}
			 * @private 
			 */
			ScratchHome.height_SH3D = ScratchHome.sprite.lookupVariableById("9YR=}_qqo.V|FmE2ZCj~");

			/**
			 * The width of SH3D's SVG file got from sprite.
			 * @type {int}
			 * @private 
			 */
			ScratchHome.width_SH3D = ScratchHome.sprite.lookupVariableById("Cg-Li`$:dyXAI+Umru~+");

			// initialize the static variable clickObjectlist of ScratchHome class
			// with a Map of objects (String) as keys and boolean as value to indicate
			// if an object was clicked on SweetHome3D or not.
			var clickObjectlist = {};
			for (let o of this.objectlist.value) {
				clickObjectlist[o] = false;
			}
			ScratchHome.clickObjectlist = clickObjectlist;

			// Create a list of lights with their status (On or Off)
			this.statusLightlist = {};
			for (let l of this.lamplist.value) {
				this.statusLightlist[l] = "Off";
			}
		}
	}

	/**
	 * @returns {object} Metadata for ScratchHome extension and its blocks.
	 */
	getInfo() {
		return {
			"id": "scratchhome",
			"name": "ScratchHome",
			"blocks": this.getblocks(),
			"menus": this.getMenus()
		};
	}

	/**
	 * @returns {Array} of blocks for ScratchHome extension.
	 */
	getBlocks() {
		var typeBlocks = "";
		// initialize result with 3 simple blocks with object and light empty
		var result = [{
			"opcode": "setColor",
			"blockType": "command",
			"text": "colorer [object] en [colorList] ",
			"arguments": {
				"object": {
					"type": "string",
					"defaultValue": ""
				},
				"colorList": {
					"type": "string",
					"menu": "colorMenu"
				}
			}
		}, {
			"opcode": "reSet",
			"blockType": "command",
			"text": "reinitialiser [object]",
			"arguments": {
				"object": {
					"type": "string",
					"defaultValue": ""
				}
			}
		}, {
			"opcode": "switchOnOff",
			"blockType": "command",
			"text": "[switchList] le/la [lamp]",
			"arguments": {
				"switchList": {
					"type": "string",
					"menu": "switchMenu"
				},
				"lamp": {
					"type": "string",
					"defaultValue": ""
				},
			}
		}];

		// if user opened the file SB3 generated by SweetHome3D's plugin 
		// then look up for typeBlocks variable to create scrolling menu blocks or simple blocks
		if (ScratchHome.sprite) {
			typeBlocks = ScratchHome.sprite.lookupVariableById("L^i{fNhE#uQ8.g=D;O~O");
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
						"opcode": "reSet",
						"blockType": "command",
						"text": "reinitialiser [object]",
						"arguments": {
							"object": {
								"type": "string",
								"menu": "objectMenu"
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
				if (this.lamplist.value.length > 0) {
					result.push({
						"opcode": "switchOnOff",
						"blockType": "command",
						"text": "[switchList] le/la [lamp]",
						"arguments": {
							"switchList": {
								"type": "string",
								"menu": "switchMenu"
							},
							"lamp": {
								"type": "string",
								"menu": "lampMenu"
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
			for (let l of this.lamplist.value) {
				result.push({
					"opcode": "switchOnOff",
					"blockType": "command",
					"text": "[switchList] le/la [lamp]",
					"arguments": {
						"switchList": {
							"type": "string",
							"menu": "switchMenu"
						},
						"lamp": {
							"type": "string",
							"defaultValue": l
						}
					}
				});
			}
		}

		for (let o of this.objectlist.value) {
			result.push({
				"opcode": "reSet",
				"blockType": "command",
				"text": "reinitialiser [object]",
				"arguments": {
					"object": {
						"type": "string",
						"defaultValue": o
					}
				}
			});
		}

		// create sensing blocks for every object
		if (this.objectlist && this.objectlist.value.length > 0) {
			for (let o of this.objectlist.value) {
				result.push({
					"opcode": "isObjectClicked",
					blockType: BlockType.BOOLEAN,
					"text": "[object] est clické ?",
					"arguments": {
						"object": {
							"type": "string",
							"defaultValue": o
						}
					}
				});
			}
		}

		// add the variables : message, status,x_SH3D,y_SH3D and direction_SH3D
		result.push(
			{
				"opcode": 'getMessage',
				"blockType": "reporter",
				"text": "message"
			});
		result.push(
			{
				"opcode": 'getStatus',
				"blockType": "reporter",
				"text": "status"
			});
		result.push(
			{
				"opcode": 'getX_SH3D',
				"blockType": "reporter",
				"text": "x_SH3D"
			});
		result.push(
			{
				"opcode": 'getY_SH3D',
				"blockType": "reporter",
				"text": "y_SH3D"
			});
		result.push(
			{
				"opcode": 'getDirection_SH3D',
				"blockType": "reporter",
				"text": "direction_SH3D"
			});

		return result;
	}

	/**
   * @returns {Array} of menus for ScratchHome extension.
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

	/**
   * send a request to SweetHome3D to reset the color of an object .
   * @param {string} object The object to reset.
   */
	reSet({ object }) {
		this.connect();
		this.send("reset/" + object);
	}

	/**
	* connect to the server of communication with a WebSocket.
	*/
	connect() {
		// open the connection if one does not exist
		if (this.socket !== null
			&& this.socket.readyState !== WebSocket.CLOSED) {
			this.sendPosition();
			return;
		}

		// Create a websocket
		this.socket = new WebSocket(this.wsUrl);

		// change the status to connected if socket is opened
		this.socket.onopen = function (event) {
			ScratchHome.status = "Connected!";
		};

		// get the message from server and treat it
		this.socket.onmessage = function (event) {
			var msgrec = event.data

			// if its a message indicting the current position of Observer Camera
			// then change the variables x_SH3D, y_SH3D and direction_SH3D
			// and move Observer sprite to this position
			if (msgrec.startsWith("position")) {
				var pos = msgrec.split("/")
				ScratchHome.x_SH3D = parseFloat(pos[1]);
				ScratchHome.y_SH3D = parseFloat(pos[2]);
				ScratchHome.direction_SH3D = parseFloat(pos[3]);

				// Change the position Of Observer Sprite if SweetHome3D 
				// indicates automatic in its message
				if (ScratchHome.sprite && pos[4]) {

					// adapt position and direction to match Scratch View
					var x = -240 + (ScratchHome.x_SH3D + 200) * 480 / (ScratchHome.width_SH3D.value);
					var y = 180 + (-ScratchHome.y_SH3D + 60) * 360 / (ScratchHome.height_SH3D.value);
					var direction = (ScratchHome.direction_SH3D * 180 / Math.PI - 90);
					ScratchHome.sprite.setXY(x, y);
					ScratchHome.sprite.setDirection(direction);
				}

				// if its a message indicating what object was clicked
				// then set its value on clickObjectlist to true
			} else if (msgrec.startsWith("click")) {
				var click = msgrec.split("/")
				ScratchHome.clickObjectlist[click[1]] = true;

				//if its a message indicating that it should send position of Observer Sprite 
				// from Scratch to SweetHome3D then set the static variable to true else false
			} else if (msgrec.startsWith("automatic")) {
				var auto = msgrec.split("/");
				if (auto[1]) {
					ScratchHome.automatic = true;
				} else {
					ScratchHome.automatic = false;
				}

				//else store the message on the static variable message
			} else {
				ScratchHome.message = event.data;
			}
		};


		// change the status to connection closed if socket is closed
		this.socket.onclose = function (event) {
			ScratchHome.status = "Connection Closed";
		};
	}

	/**
   * send a message to the server of communication.
   */
	send(text) {
		this.socket.send(text);
	}

	/**
   * send Observer Sprite's position to SweetHome3D
   */
	sendPosition(text) {
		if (ScratchHome.automatic === true) {
			if (ScratchHome.sprite.x !== ScratchHome.x_Scratch | ScratchHome.sprite.y !== ScratchHome.y_Scratch | ScratchHome.sprite.direction !== ScratchHome.direction_Scratch) {
				ScratchHome.x_Scratch = ScratchHome.sprite.x;
				ScratchHome.y_Scratch = ScratchHome.sprite.y;
				ScratchHome.direction_Scratch = ScratchHome.sprite.direction;

				// adapt position to match SweetHome3D view
				var x = -200 + (ScratchHome.x_Scratch + 240) * (ScratchHome.width_SH3D.value) / 480;
				var y = -(-60 + (ScratchHome.y_Scratch - 180) * (ScratchHome.height_SH3D.value) / 360);
				var direction = ((ScratchHome.direction_Scratch + 90) * Math.PI / 180);

				this.send("position/" + x + "/" + y + "/" + direction);
				ScratchHome.x_SH3D = x;
				ScratchHome.y_SH3D = y;
				ScratchHome.direction_SH3D = direction;

			}
		}
	}

	/**
   * send a request to SweetHome3D to color an object with a specific color .
   * @param {string} object The object to color.
   * @param {string} colorList The color to color with.
   */
	setColor({ object, colorList }) {
		this.connect();
		this.send("setColor/" + object + "/" + colorList);
	}

	/**
   * send a request to SweetHome3D to swith On/Off a light.
   * @param {string} switchList On/Off.
   * @param {string} lamp The light to swith On/Off.
   */
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

	/**
	* return true if an object was clicked.
	* @param {string} object The object clicked or not.
	* @returns {boolean}
	*/
	isObjectClicked({ object }) {
		// store the value (true or false) of this object in clickObjectlist, and set it to false
		var result = ScratchHome.clickObjectlist[object];
		ScratchHome.clickObjectlist[object] = false;
		return result;
	}

	/**
	   * get the current message of server.
	   * @returns {string}
	*/
	getMessage() {
		this.connect();
		return ScratchHome.message;
	}

	/**
   * get the current status of connection.
   * @returns {string}
   */
	getStatus() {
		this.connect();
		return ScratchHome.status;
	}

	/**
 * get the current x_SH3D of Observer sprite.
 * @returns {int}
 */
	getX_SH3D() {
		return ScratchHome.x_SH3D;
	}

	/**
	 * get the current y_SH3D of Observer sprite.
	 * @returns {int}
	 */
	getY_SH3D() {
		return ScratchHome.y_SH3D;
	}

	/**
   * get the current direction_SH3D of Observer sprite.
   * @returns {int}
   */
	getDirection_SH3D() {
		return ScratchHome.direction_SH3D;
	}
}

(function () {
	var extensionClass = ScratchHome
	if (typeof window === "undefined" || !window.vm) {
		Scratch.extensions.register(new extensionClass())
	}
	else {
		var extensionInstance = new extensionClass(window.vm.extensionManager.runtime)
		var serviceName = window.vm.extensionManager._registerInternalExtension(extensionInstance)
		window.vm.extensionManager._loadedExtensions.set(extensionInstance.getInfo().id, serviceName)
	}
})()

