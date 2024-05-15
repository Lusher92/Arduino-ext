> # Compilable Scratch is in the “master” branch

> [!NOTE]
> ### From the [MrYsLab](https://github.com/MrYsLab/s3onegpio)' project<br/>
> To [set up](https://mryslab.github.io/s3-extend/) the project with the arduino board and the python server

> [!TIP]
> ### Useful git comands
>```git init``` To initialize the local git <br/>
>```git add .``` To add all modifys files to index <br/>
>```git commit -m "[ur_msg]"``` for save it <br/>
>```git branch``` show urs branches <br/>
>```git checkout [_name_of_ur_branches_]``` To chose ur branch <br/>
>```git push```/```git push origin master``` To push ur project

## Git Scratch :

```
git clone https://github.com/llk/scratch-gui
```
```
git clone https://github.com/llk/scratch-vm
```

## Commands to compile :

### in scratch-main :

```
cd scratch-vm
npm install
npm link
cd ../scratch-gui
npm install
npm link scratch-vm
npm start
```