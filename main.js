// Module imports
require ('prototype.spawn') ();

var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleBuilder2 = require('role.builder2');
var roleRepairer = require('role.repairer');
var roleMaintainer = require('role.maintainer');
var roleClaimer = require('role.claimer');
var roleMiner = require('role.miner');
var roleHauler = require('role.hauler');
var roleMelee = require('role.melee');
var roleBlocker = require('role.blocker');
var roleGeneric = require('role.generic');
// var roleRanger = require('role.ranger');



// Variable definitions
var newName = undefined;
var logged = undefined;
var mySpawns = Game.spawns;


module.exports.loop = function () {

    // Yellow flag means claim the room
    let roomFlags =  _.filter(Game.flags, (f) => f.color == COLOR_YELLOW);
    for (let i = 0; i < roomFlags.length; i++){
        let spawner = '';
        let flagName = roomFlags[i].name;

        switch (roomFlags[i].secondaryColor) {
            case COLOR_RED:
                spawner = 'Alpha';
                break;
            case COLOR_PURPLE:
                spawner = 'Beta';
                break;
            case COLOR_GREEN:
                spawner = 'Gamma';
                break;
            default:
                spawner = 'Alpha';
        }
        let claimers = _.filter(Game.creeps, (creep) => creep.memory.role == 'claimer');
        let found = false;

        for (let j = 0; j < claimers.length; j++){
            if (claimers[j].memory.flag == roomFlags[i]){
                console.log('Found match for flag ' + flagName);
                found = true;
            }
        }
        if (!found) {
            cName = 'Claimer_' + flagName;
            cBody = [CLAIM, CLAIM, MOVE];

            if ((Game.spawns[spawner].canCreateCreep(cBody) == OK) && !Game.spawns[spawner].spawning ) {
                Game.spawns[spawner].createCreep(cBody, cName, {role: 'claimer', flag: roomFlags[i]});
            }
        }
    }


    // Clean memory of dead creeps
    for(let dead in Memory.creeps) {
        if(!Game.creeps[dead]) {
            console.log(dead + ' died. Removing creep from memory.');
            // logCreeps();
            logged = false;
            delete Memory.creeps[dead];
        }
    }

//    console.log();


// New Main Loop for Rooms
    var myRooms = Object.keys(Game.rooms);
    for (let i = 0; i < myRooms.length; i++) {
        let room = Game.rooms[myRooms[i]];
        let roomName = room.name;
        let roomSources = room.find(FIND_SOURCES);
        let level = room.controller.level;
        let energy = room.energyAvailable;
        let energyCap = room.energyCapacityAvailable;
        let roomCreeps = room.find(FIND_MY_CREEPS);
        let roomSpawns = room.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType === STRUCTURE_SPAWN});

        // Minimum Number of Creeps of each type (room or map)
        let minGeneric = 8;

        if (room.controller.my && level < 3) {
            // Code goes here for starting new low level rooms
            let cRole = 'generic';
            let cName = cRole + '_' + _.padLeft(new Date().getMinutes(), 2, '0');
            let cBody = [];

            if (energyCap == 300 || roomCreeps.length == 0) cBody = [WORK, CARRY, CARRY, MOVE, MOVE];
            else if (energyCap == 350) cBody = [WORK, CARRY, CARRY, CARRY, MOVE, MOVE];
            else if (energyCap < 500) cBody = [WORK, WORK, CARRY, CARRY, MOVE, MOVE];
            else if (energyCap >= 500) cBody = [WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];

            if (roomCreeps.length < minGeneric && (roomSpawns[0].canCreateCreep(cBody) == OK) && !roomSpawns[0].spawning ) {
                roomSpawns[0].createCreep(cBody, cName, {role: cRole});
                console.log('Spawning creep ' + cName + ' in room ' + room.name);
            }
        }

        for (let i = 0; i < roomSources.length; i++) {
            let sourceMiner = _.filter(Game.creeps, (creep) => creep.memory.assignedSource == roomSources[i].id);
            if (sourceMiner.length == 0) {
                if (room.controller.level > 0 || (room.controller.reservation)) {
                }
                else {
                }
            }
            else {
            }
        }
    }
   // console.log();

    for (let roomSpawn in mySpawns) {
        if (mySpawns.hasOwnProperty(roomSpawn)) {

            let room = Game.spawns[roomSpawn].room;

            // Set minimum number of creeps
            var minHaulers = 1;
            var minUpgrader = 2;
            var minBuilder = 1;
            var minBuilder2 = 1;
            var minRepairer = 0;
            var minMaintainer = 1;
            var minClaimers = 0;
            var minClaimers2 = 0;
            var minMelee = 1;
            var minBlockers = 0;
            var minRangers = 0;

            var Sources = Game.spawns[roomSpawn].room.find(FIND_SOURCES);
            var minMiners = Sources.length;
            var minHarvester = 1 * minMiners;

            // Link Code
            let fromLinks = [];
            let toLink = undefined;
            let storage = Game.spawns[roomSpawn].room.find(FIND_STRUCTURES, {
                filter: {structureType: STRUCTURE_STORAGE}
            });

            let Links = Game.spawns[roomSpawn].room.find(FIND_MY_STRUCTURES, {
                filter: {structureType: STRUCTURE_LINK}
            });

            for (let i = 0; i < Links.length; i++) {
                if (Links[i].pos.inRangeTo(storage[0], 3)) toLink = Links[i];
                else fromLinks.push(Links[i]);
            }

            if (toLink) {
                room.memory.toLink = toLink.id;
                for (let i = 0; i < fromLinks.length; i++) {
                    let myFromLink = fromLinks[i];
                    if ((myFromLink.cooldown == 0) && (toLink.energy <= 300) && (myFromLink.energy >= 500)) {
                        console.log("TRANSFERRING ENERGY VIA LINK IN ROOM " + room.name);
                        myFromLink.transferEnergy(toLink);
                    }
                }
            }

            // Tower defense - this code needs to move to a module and be generalized!
            var towers = Game.spawns[roomSpawn].room.find(FIND_MY_STRUCTURES, {
                filter: {structureType: STRUCTURE_TOWER}
            });

            for (let tower of towers) {
                var targetEnemy = tower.pos.findClosestByRange(tower.pos.findInRange(FIND_HOSTILE_CREEPS, 35));
                var damagedCreep = tower.pos.findClosestByRange(tower.pos.findInRange(FIND_MY_CREEPS, 15, {
                    filter: (c) => c.hits < c.hitsMax
                }));
                var damagedStruc = tower.pos.findClosestByRange(tower.pos.findInRange(FIND_STRUCTURES, 30, {
                    filter: (s) => (s.hits < s.hitsMax * 0.9) &&
                    (s.structureType != STRUCTURE_RAMPART && s.structureType != STRUCTURE_WALL)
                }));

                if (targetEnemy != undefined) {
                    tower.attack(targetEnemy);
                }
                else if (damagedStruc != undefined) {
                    tower.repair(damagedStruc);
                }
                else if (damagedCreep != undefined) {
                    tower.heal(damagedCreep);
                }
            }

            // Create an array of each type of creep
            var myCreeps = Game.spawns[roomSpawn].room.find(FIND_MY_CREEPS);
            var harvesters = _.filter(myCreeps, (creep) => creep.memory.role == 'harvester');
            var upgraders = _.filter(myCreeps, (creep) => creep.memory.role == 'upgrader');
            var builders = _.filter(myCreeps, (creep) => creep.memory.role == 'builder');
            var builders2 = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder2');
            var repairers = _.filter(myCreeps, (creep) => creep.memory.role == 'repairer');
            var maintainers = _.filter(myCreeps, (creep) => creep.memory.role == 'maintainer');
            var melees = _.filter(Game.creeps, (creep) => creep.memory.role == 'melee');
            var blockers = _.filter(Game.creeps, (creep) => creep.memory.role == 'blocker');
            var rangers = _.filter(myCreeps, (creep) => creep.memory.role == 'ranger');
            var miners = _.filter(myCreeps, (creep) => creep.memory.role == 'miner');
            var haulers = _.filter(myCreeps, (creep) => creep.memory.role == 'hauler');
            var energyCap = Game.spawns[roomSpawn].room.energyCapacityAvailable;
            var energy = Game.spawns[roomSpawn].room.energyAvailable;
            if (energyCap > 800) energyCap = 800;

            /*           console.log ('Number of creeps in ' + room + ': ' + myCreeps.length + '(M:' + miners.length + ' H:' + haulers.length +
             ' Hv:' + harvesters.length + ' U:' + upgraders.length +
             ' B: ' + builders.length + ' R:' + repairers.length +
             ' Mt:' + maintainers.length + ')');
             */
            if (Game.spawns[roomSpawn].room.controller.my && Game.spawns[roomSpawn].room.controller.level >= 3) {
                if (miners.length == 0 && energy < 650 && energy >= 150) {
                    newName = Game.spawns[roomSpawn].createCustomCreep(150, 'miner', room);
                }
                //           else if (haulers.length == 0 && energy < 300&& energy >= 200) {
                //               newName = Game.spawns[roomSpawn].createCustomCreep(200, 'hauler',room);
                //           }
                else if (harvesters.length == 0 && energy >= 300 && energy < 600) {
                    newName = Game.spawns[roomSpawn].createCustomCreep(energy, 'harvester', room);
                }
                else if (miners.length < minMiners && energy >= 650) {
                    newName = Game.spawns[roomSpawn].createCustomCreep(energyCap, 'miner', room);
                }
                else if (haulers.length < minHaulers && energy >= energyCap &&  Game.spawns[roomSpawn].room.controller.level > 3) {
                    newName = Game.spawns[roomSpawn].createCustomCreep(energyCap, 'hauler', room);
                }
                else if (harvesters.length < minHarvester && energy >= 600) {
                    newName = Game.spawns[roomSpawn].createCustomCreep(energyCap, 'harvester', room);
                }
                else if (upgraders.length < minUpgrader && energy >= energyCap) {
                    newName = Game.spawns[roomSpawn].createCustomCreep(energyCap, 'upgrader', room);
                }
                else if (builders2.length < minBuilder2 && energy >= energyCap && roomSpawn == 'Alpha') {
                    newName = Game.spawns[roomSpawn].createCustomCreep(energy, 'builder2', room);
                }
                else if (builders.length < minBuilder && energy >= energyCap) {
                    newName = Game.spawns[roomSpawn].createCustomCreep(energyCap, 'builder', room);
                }
                else if (repairers.length < minRepairer && energy >= energyCap) {
                    newName = Game.spawns[roomSpawn].createCustomCreep(energyCap, 'repairer', room);
                }
                else if (maintainers.length < minMaintainer && energy >= energyCap&&  Game.spawns[roomSpawn].room.controller.level > 3) {
                    newName = Game.spawns[roomSpawn].createCustomCreep(energyCap, 'maintainer', room);
                }
                else if (blockers.length < minBlockers && energy >= 1070) {
                    newName = Game.spawns[roomSpawn].createCustomCreep(1070, 'blocker', room);
                }
                else if (melees.length < minMelee && energy >= energyCap) {
                    newName = Game.spawns[roomSpawn].createCustomCreep(energyCap, 'melee', room);
                }
            }

        }
    }

    // Assign creeps their jobs
    for(let name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        } else if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        } else if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        } else if(creep.memory.role == 'builder2') {
            roleBuilder2.run(creep);
        } else if(creep.memory.role == 'repairer') {
            roleRepairer.run(creep);
        } else if(creep.memory.role == 'maintainer') {
            roleMaintainer.run(creep);
        } else if(creep.memory.role == 'claimer') {
            roleClaimer.run(creep);
        } else if(creep.memory.role == 'melee') {
            roleMelee.run(creep);
        } else if(creep.memory.role == 'blocker') {
            roleBlocker.run(creep);
        } else if(creep.memory.role == 'ranger') {
            roleRanger.run(creep);
        }else if(creep.memory.role == "miner") {
            roleMiner.run(creep);
        }else if(creep.memory.role == "hauler") {
            roleHauler.run(creep);
        }else if(creep.memory.role == "generic") {
            roleGeneric.run(creep);
        }
    }
};

