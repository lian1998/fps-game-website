import 'normalize.css'
import * as THREE from 'three/build/three.module.js';
import { GameInstance } from '@src/core/GameInstance';
import { CycleInterface, LoopInterface } from '@src/core/interfaces/GameInterfaces';
import { GameWorld, Scenes } from '@src/core/GameWorld';
import { LevelMirage } from '@src/game/levels/LevelMirage';
import { LocalPlayer } from './game/player/LocalPlayer';
import { GBDMaterial } from './game/GameSystem';


import { DOMLayer } from '@src/viewlayers/DOMLayer';
import { GLViewportLayer } from '@src/viewlayers/GLViewportLayer';
import { SkyLayer } from '@src/viewlayers/layers/SkyLayer';

import { CrosshairLayer } from '@src/viewlayers/layers/CrosshairLayer';

import { HandModelLayer } from '@src/viewlayers/layers/HandModelLayer';

import { BulletHoleLayer } from '@src/viewlayers/layers/Scene.BulletHoleLayer';
import { BulletHoleAshLayer } from '@src/viewlayers/layers/Scene.BulletHoleAshLayer';
import { BulletHoleFlashLayer } from '@src/viewlayers/layers/Scene.BulletHoleFlashLayer';
import { BulletTracerLayer } from '@src/viewlayers/layers/Scene.BulletTracerLayer';

import { ChamberBulletShell } from '@src/viewlayers/layers/Weapon.ChamberBulletShellLayer';

import { MuzzleFlashLayer } from '@src/viewlayers/layers/Weapon.MuzzleFlashLayer';
import { ChamberSmokeLayer } from '@src/viewlayers/layers/Weapon.ChamberSmokeLayer';


const objects = {

    'level': new LevelMirage(),
    // 'test': new TestRecoil(),
    'domlayer': new DOMLayer(),
    'glviewport': new GLViewportLayer(),
    'sky layer': new SkyLayer(),
    'hand model layer': new HandModelLayer(),
    'crosshair layer': new CrosshairLayer(),
    'bullethole layer': new BulletHoleLayer(),
    'bullethole ash layer': new BulletHoleAshLayer(),
    'bullethole flash layer': new BulletHoleFlashLayer(),
    'bullet tracer layer': new BulletTracerLayer(),
    'bullet shell layer': new ChamberBulletShell(),
    'smoke layer': new ChamberSmokeLayer(),
    'muzzleflash layer': new MuzzleFlashLayer(),
    'local player': new LocalPlayer(),

};

Object.keys(objects).forEach(key => {

    GameInstance.GameContainer.objects.set(key, objects[key]);
    if ((<CycleInterface><any>objects[key]).init) GameInstance.GameContainer.cycleObjects.push(objects[key]);
    if ((<LoopInterface><any>objects[key]).callEveryFrame) GameInstance.GameContainer.loopObjects.push(objects[key]);

})

GameInstance.GameLoop.init();
GameInstance.GameLoop.loop();