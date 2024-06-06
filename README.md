> # Compilable Scratch for Windows is in the "windows-master" branch


# TABLES OF CONTENTS

1. [Useful git commands](#Useful-git-commands)
2. [Repository zone](#Repository-zone)
   1. [Sratch](#Git-Scratch-)
   2. [S3oneGpio](#The-S3oneGpio-project-of-MrYsLab)
   3. [ScratchHome2.0](#The-ScratchHome2-project)
3. [Set up your extension](#set-up-your-extension-)
   1. [Add your pictures](#Add-your-pictures)
   2. [Add path and description](#2.-Add-path-and-description)
   3. [Add your js file containing the code for your extension](#3.-Add-your-js-file-containing-the-code-for-your-extension)
   4. [Add the require](#4.-Add-the-require)

> [!CAUTION]
> To start the ScratchHome extension you must first launch Sweet Home 3D, then follow the steps in this order:
>
> start Scratch
> import the sb3 file
> then select the extension
>
> If the order is not respected, the extension may not work correctly and you may get an error message.

> [!TIP]
> ### Useful git commands
>```git clone --branch master git@github.com:Lusher92/Arduino-ext.git``` <br/>
>```git init``` To initialize the local git <br/>
>```git add .``` To add all modifys files to index <br/>
>```git commit -m "[ur_msg]"``` for save it <br/>
>```git branch``` show yours branches <br/>
>```git checkout [_name_of_ur_branches_]``` To chose your branch <br/>
>```git push```/```git push origin master``` To push your project

## Repository zone
### Git Scratch :

```
git clone https://github.com/llk/scratch-gui
```
```
git clone https://github.com/llk/scratch-vm
```
### The S3oneGpio project of MrYsLab
Here is the [git](https://github.com/MrYsLab/s3onegpio)
To [set up](https://mryslab.github.io/s3-extend/) the project with the arduino board and the python server
```
git clone https://github.com/MrYsLab/s3onegpio
```

### The ScratchHome2 project
Here is the [git](https://github.com/kimokipo/ScratchHome2.0)
```
git clone https://github.com/kimokipo/ScratchHome2.0
```

## Commands to compile :

### in stuff :

```
cd scratch-vm
npm install
npm link
cd ../scratch-gui
npm install
npm link scratch-vm
npm start
```

# Set up your extension :
Your can find ([another tuto](https://brightchamps.com/blog/make-scratch-extension-using-javascript/)) set-up this.

## 1. Add your pictures
first, go on path : `./stuff/scratch-gui/src/lib/libraries/extensions`

1. Creat a folder : `[name_of_ur_extension]`
   
2. Go inside !

3. Add yours pictures :
	- [name_of_ur_extension].png
	- [name_of_ur_extension]-small.png


## 2. Add path and description
first, go on path : `./stuff/scratch-gui/src/lib/libraries/extensions/index.js` <br/>

```
//extensions already in place
import [name_of_ur_extension]Image from './[name_of_ur_extension]/[name_of_ur_extension].png';
import [name_of_ur_extension]InsetIconURL from './[name_of_ur_extension]/[name_of_ur_extension]-small.png';

export default [
    {
        //extensions already in place
    },
    {
		name: '[NAME]',
		extensionId: '[name_of_ur_extension]',
		collaborator: "[UR_PSEUDO]",
		iconURL: [name_of_ur_extension]Image,
		insetIconURL: [name_of_ur_extension]InsetIconURL,
		description: '[UR_DESCRPTION]',
		featured: [true or false],                      //mine was true
		disabled: [true or false],                      //mine was false
		internetConnectionRequired: [true or false],    //mine was true
		bluetoothRequired: [true or false],             //mine was false
		helpLink: '[ur_helplink_if_u_got_one]
    }
];
```

## 3. Add your js file containing the code for your extension
first, go on path : `./stuf/scratch-vm/src/extension/scratch3_[name_of_ur_extension]/index.js`

- You don't know how to creat it ? [Click here](https://www.instructables.com/Making-Scratch-30-Extensions/) or
[here](https://scratch.mit.edu/discuss/48/) or
[here again](https://medium.com/@hiroyuki.osaki/how-to-develop-your-own-block-for-scratch-3-0-1b5892026421)
and why not [here](https://www.foolproofme.org/articles/395-the-dangers-of-randomly-clicking-links) ?

## 4. Add the require
first, go on path : `./stuf/scratch-vm/src/extension-support/extensio-manager.js`
```
const builtinExtensions = {
	// This is an example that isn't loaded with the other core blocks,
	// but serves as a reference for loading core blocks as extensions.
	coreExample: () => require('../blocks/scratch3_core_example'),
	// These are the non-core built-in extensions.
	pen: () => require('../extensions/scratch3_pen'),
	wedo2: () => require('../extensions/scratch3_wedo2'),
	music: () => require('../extensions/scratch3_music'),
	microbit: () => require('../extensions/scratch3_microbit'),
	text2speech: () => require('../extensions/scratch3_text2speech'),
	translate: () => require('../extensions/scratch3_translate'),
	videoSensing: () => require('../extensions/scratch3_video_sensing'),
	ev3: () => require('../extensions/scratch3_ev3'),
	makeymakey: () => require('../extensions/scratch3_makeymakey'),
	boost: () => require('../extensions/scratch3_boost'),
	gdxfor: () => require('../extensions/scratch3_gdx_for'),
	onegpioArduino: () => require('../extensions/scratch3_onegpioArduino'),
	sweetHomeExtension: () => require('../extensions/scratch3_sweetHomeExtension')
	[name_of_ur_extension]: () => require('../extension/scratch3_[name_of_ur_extension]')
};
```
## Now run it if you haven't already done so
<br/>
<br/>

### Link of the [local servor](http://localhost:8601) :

http://localhost:8601


## Commands for Linux :
- Open the venv : <br/>
`source .venv/bin/activate` <br/>
`s3a` <br/>

- If problems of permissions :<br/>
https://forum.ubuntu-fr.org/viewtopic.php?id=2037251

<br/>

## Comands for Windows :
- [long path](https://www.it-connect.fr/windows-10-comment-activer-la-gestion-des-chemins-trop-long/)

