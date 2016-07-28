// Module imports
require ('prototype.spawn') ();

var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleBuilder2 = require('role.builder2');
var roleRepairer = require('role.repairer');
var roleMaintainer = require('role.maintainer');
var roleClaimer = require('role.claimer');
var roleClaimer2 = require('role.claimer2');
var roleMiner = require('role.miner');
var roleHauler = require('role.hauler');
var roleMelee = require('role.melee');
// var roleRanger = require('role.ranger');



// Variable definitions
var newName = undefined;
var logged = undefined;
var mySpawns = Game.spawns;


module.exports.loop = function () {

    // Clean memory of dead creeps
    for(let dead in Memory.creeps) {
        if(!Game.creeps[dead]) {
            console.log(dead + ' died. Removing creep from memory.');
            // logCreeps();
            logged = false;
            delete Memory.creeps[dead];
        }
    }

    // Fire off From Link
    var myFromLink = Game.spawns.Alpha.room.lookForAt('structure', 21, 26)[0];
    var myToLink = Game.spawns.Alpha.room.lookForAt('structure', 8, 15)[0];
    if (myFromLink && myToLink){
        if ((myFromLink.cooldown == 0) && (myToLink.energy <= 0) && (myFromLink.energy == myFromLink.energyCapacity)) {
            console.log("TRANSFERING ENERGY VIA LINK");
            myFromLink.transferEnergy(myToLink);
        }
    }

//    console.log();

    for (let roomSpawn in mySpawns) {
        if (mySpawns.hasOwnProperty(roomSpawn)) {

            let room = Game.spawns[roomSpawn].room.name;
            // Set minimum number of creeps
            var minHarvester = 1;
            var minUpgrader = 1;
            var minBuilder = 1;
            var minBuilder2 = 1;
            var minRepairer = 0;
            var minMaintainer = 1;
            var minClaimers = 1;
            var minClaimers2 = 1;
            var minMelee = 2;
            var minRangers = 0;

            var Sources = Game.spawns[roomSpawn].room.find(FIND_SOURCES);
            var minMiners = Sources.length;
            var minHaulers = 1 * minMiners;

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
            var harvesters =  _.filter(myCreeps, (creep) => creep.memory.role == 'harvester');
            var upgraders = _.filter(myCreeps, (creep) => creep.memory.role == 'upgrader');
            var builders = _.filter(myCreeps, (creep) => creep.memory.role == 'builder');
            var builders2 = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder2');
            var repairers = _.filter(myCreeps, (creep) => creep.memory.role == 'repairer');
            var maintainers = _.filter(myCreeps, (creep) => creep.memory.role == 'maintainer');
            var claimers = _.filter(Game.creeps, (creep) => creep.memory.role == 'claimer');
            var claimers2 = _.filter(Game.creeps, (creep) => creep.memory.role == 'claimer2');
            var melees = _.filter(Game.creeps, (creep) => creep.memory.role == 'melee');
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
            if (miners.length == 0 && energy < 300 && energy >= 150) {
                newName = Game.spawns[roomSpawn].createCustomCreep(150, 'miner', roomSpawn);
            }
            else if (haulers.length == 0 && energy < 300&& energy >= 200) {
                newName = Game.spawns[roomSpawn].createCustomCreep(200, 'hauler',roomSpawn);
            }
            else if (harvesters.length == 0 && energy >= 300 && energy < 600) {
                newName = Game.spawns[roomSpawn].createCustomCreep(energy, 'harvester',roomSpawn);
            }
            else if (miners.length < minMiners && energy >= 650) {
                newName = Game.spawns[roomSpawn].createCustomCreep(energyCap, 'miner',roomSpawn);
            }
            else if (haulers.length < minHaulers && energy >= energyCap) {
                newName = Game.spawns[roomSpawn].createCustomCreep(energyCap, 'hauler', roomSpawn);
            }
            else if (harvesters.length < minHarvester && energy >= 600) {
                newName = Game.spawns[roomSpawn].createCustomCreep(energyCap, 'harvester', roomSpawn);
            }
            else if (upgraders.length < minUpgrader && energy >= energyCap) {
                newName = Game.spawns[roomSpawn].createCustomCreep(energyCap, 'upgrader', roomSpawn);
            }
            else if (claimers.length < minClaimers && energy >= 700 && roomSpawn == 'Alpha') {
                newName = Game.spawns[roomSpawn].createCustomCreep(energy, 'claimer',roomSpawn);
            }
            else if (claimers2.length < minClaimers2 && energy >= 700 && roomSpawn == 'Alpha') {
                newName = Game.spawns[roomSpawn].createCustomCreep(energy, 'claimer2',roomSpawn);
            }
            else if (builders2.length < minBuilder2 && energy >= energyCap && roomSpawn == 'Alpha') {
                newName = Game.spawns[roomSpawn].createCustomCreep(energy, 'builder2',roomSpawn);
            }
            else if (builders.length < minBuilder && energy >= energyCap) {
                newName = Game.spawns[roomSpawn].createCustomCreep(energyCap, 'builder',roomSpawn);
            }
            else if (repairers.length < minRepairer && energy >= energyCap) {
                newName = Game.spawns[roomSpawn].createCustomCreep(energyCap, 'repairer',roomSpawn);
            }
            else if (maintainers.length < minMaintainer && energy >= energyCap) {
                newName = Game.spawns[roomSpawn].createCustomCreep(energyCap, 'maintainer',roomSpawn);
            }
            else if (melees.length < minMelee && energy >= energyCap) {
                newName = Game.spawns[roomSpawn].createCustomCreep(energyCap, 'melee',roomSpawn);
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
        } else if(creep.memory.role == 'claimer2') {
            roleClaimer2.run(creep);
        } else if(creep.memory.role == 'melee') {
            roleMelee.run(creep);
        } else if(creep.memory.role == 'ranger') {
            roleRanger.run(creep);
        }else if(creep.memory.role == "miner") {
            roleMiner.run(creep);
        }else if(creep.memory.role == "hauler") {
            roleHauler.run(creep);
        }
    }
    function logCreeps () {
        console.log('Miners: ' + miners.length + ' Haulers: ' + haulers.length + ' Harvesters: ' + harvesters.length +
            ' Upgraders: ' + upgraders.length + ' Claimers: ' + claimers.length + ' Builders: ' + builders.length +
            ' Repairers: ' + repairers.length + ' Maintainers: ' + maintainers.length);
    }
};

