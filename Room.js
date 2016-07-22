//////////////////////////////////////////////////////////////////////
//      Module:     Room                                            //
//                                                                  //
//      Purpose: Room management for each controlled room           //
//      Last Modified: 07/19/2016                                   //
//      Functions:                                                  //
//      Room: calls all of the modules to load objects and init the //
//          room                                                    //
//      Prototypes:                                                 //
//      .askForReinforcements: Room requests reinfordements from    //
//          roomHandler                                             //
//      .sendReinforcements: initializes memory for the room and    //
//          calls for reinforcements if room population does not    //
//          have at least one miner and one hauler send startup     //
//          crew. (This needs work)                                 //
//      .populate: determine how many creeps of each type are       //
//          needed in a given room and request new creeps be built  //
//                                                                  //
//////////////////////////////////////////////////////////////////////
var Population = require('Population');
var EnergyStorage = require('eStorage');
var Resources = require('Resources');
var Constructions = require('Constructions');


var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleMaintainer = require('role.maintainer');
var roleClaimer = require('role.claimer');
var roleMiner = require('role.miner');
var roleHauler = require('role.hauler');
var roleMelee = require('role.melee');
var roleRanger = require('role.ranger');

var newName = undefined;


function Room(room, roomHandler) {

// Set minimum number of creeps
    this.minHarvester = 1;
    this.minUpgrader = 2;
    this.minBuilder = 1;
    this.minRepairer = 1;
    this.minMaintainer = 1;
    this.minClaimers = 1;
    this.minHaulers = 2;
    this.minMelee = 0;
    this.minRangers = 0;
    this.spawn = room.find(FIND_MY_SPAWNS)[0];
    this.Sources = room.find(FIND_SOURCES);
    this.minMiners = this.Sources.length;

    this.room = room;
    this.roomHandler = roomHandler;
    this.creeps = room.find(FIND_MY_CREEPS);
    this.structures = [];

    this.population = new Population(this.room);
    this.storageManager = new EnergyStorage(this.room);
    this.resourceManager = new Resources(this.room, this.population);
    this.constructionManager = new Constructions(this.room);

    // The number of miners should be determined by the number of open positions around all sources,
    // their bodies might be determined by 5 work/ number of positions rounded up (or it should always be 2)
    this.population.typeDistribution.miner.max = 2;

    // This number really should be determined by the length of the path from the source to the spawn.
    this.population.typeDistribution.hauler.max = this.population.typeDistribution.miner.max * 2;

    this.harvesters = _.filter(this.creeps, (creep) => creep.memory.role == 'harvester');
    this.upgraders = _.filter(this.creeps, (creep) => creep.memory.role == 'upgrader');
    this.builders = _.filter(this.creeps, (creep) => creep.memory.role == 'builder');
    this.repairers = _.filter(this.creeps, (creep) => creep.memory.role == 'repairer');
    this.maintainers = _.filter(this.creeps, (creep) => creep.memory.role == 'maintainer');
    this.claimers = _.filter(this.creeps, (creep) => creep.memory.role == 'claimer');
    this.melees = _.filter(this.creeps, (creep) => creep.memory.role == 'melee');
    this.rangers = _.filter(this.creeps, (creep) => creep.memory.role == 'ranger');
    this.miners = _.filter(this.creeps, (creep) => creep.memory.role == 'miner');
    this.haulers = _.filter(this.creeps, (creep) => creep.memory.role == 'hauler');
    this.energyCap = room.energyCapacityAvailable;
    this.energy = room.energyAvailable;
    if (this.energyCap > 800) this.energyCap = 800;

    if (this.miners.length == 0) {
        newName = this.spawn.createCustomCreep(200, 'miner');
    }
    else if (this.haulers.length == 0) {
        newName = this.spawn.createCustomCreep(200, 'hauler');
    }
    else if (this.harvesters.length == 0 && energy >= 300 && this.energy < 600) {
        newName = this.spawn.createCustomCreep(this.energy, 'harvester');
    }
    else if (this.miners.length < this.minMiners && this.energy >= 600) {
        newName = this.spawn.createCustomCreep(this.energyCap, 'miner');
    }
    else if (this.haulers.length < this.minHaulers && this.energy >= this.energyCap) {
        newName = this.spawn.createCustomCreep(this.energyCap, 'hauler');
    }
    else if (this.harvesters.length < this.minHarvester && this.energy >= 600) {
        newName = this.spawn.createCustomCreep(this.energyCap, 'harvester');
    }
    else if (this.upgraders.length < this.minUpgrader && this.energy >= this.energyCap) {
        newName = this.spawn.createCustomCreep(this.energyCap, 'upgrader');
    }
    else if (this.claimers.length < this.minClaimers && this.energy >= 700) {
        newName = this.spawn.createCustomCreep(this.energy, 'claimer');
    }
    else if (this.builders.length < this.minBuilder && this.energy >= this.energyCap) {
        newName = this.spawn.createCustomCreep(this.energyCap, 'builder');
    }
    else if (this.repairers.length < this.minRepairer && this.energy >= this.energyCap) {
        newName = this.spawn.createCustomCreep(this.energyCap, 'repairer');
    }
    else if (this.maintainers.length < this.minMaintainer && this.energy >= this.energyCap) {
        newName = this.spawn.createCustomCreep(this.energyCap, 'maintainer');
    }
    else if (this.melees.length < this.minMelee && this.energy >= this.energyCap) {
        newName = this.spawn.createCustomCreep(this.energyCap, 'melee');
    }

    // Assign creeps their jobs
    for (let name in this.creeps) {
        if (this.creeps.hasOwnProperty(name)) {
            let creep = Game.creeps[name];
            if (creep.memory.role == 'harvester') {
                roleHarvester.run(creep);
            }
            else if (creep.memory.role == 'upgrader') {
                roleUpgrader.run(creep);
            }
            else if (creep.memory.role == 'upgrader2') {
                roleUpgrader2.run(creep);
            }
            else if (creep.memory.role == 'builder') {
                roleBuilder.run(creep);
            }
            else if (creep.memory.role == 'builder2') {
                roleBuilder2.run(creep);
            }
            else if (creep.memory.role == 'repairer') {
                roleRepairer.run(creep);
            }
            else if (creep.memory.role == 'repairer2') {
                roleRepairer2.run(creep);
            }
            else if (creep.memory.role == 'maintainer') {
                roleMaintainer.run(creep);
            }
            else if (creep.memory.role == 'claimer') {
                roleClaimer.run(creep);
            }
            else if (creep.memory.role == 'melee') {
                roleMelee.run(creep);
            }
            else if (creep.memory.role == 'ranger') {
                roleMelee.run(creep);
            }
            else if (creep.memory.role == "miner") {
                roleMiner.run(creep);
            }
            else if (creep.memory.role == "hauler") {
                roleHauler.run(creep);
            }
        }
    }
    StructureSpawn.prototype.createCustomCreep =
        function (energy, roleName) {
            var body = [];
            var cName = _.capitalize(roleName) + '_' + _.padLeft(new Date().getMinutes(), 2, '0');


            if (roleName == 'claimer') {
                var numClaim = Math.floor((energy - 100) / 600);
                var numMove = Math.floor((energy - numClaim * 600) / 50);

                for (let i = 0; i < numClaim; i++) {
                    body.push(CLAIM);
                }
                for (let i = 0; i < numMove; i++) {
                    body.push(MOVE);
                }
                console.log('Spawning new ' + roleName + ' creep: ' + cName);
                console.log('Energy: ' + energy);
                return this.createCreep(body, cName, {role: roleName, flagged: false});
            }
            else if (roleName == 'miner') {
                var sources = Game.spawns.Alpha.room.find(FIND_SOURCES);
                var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');
                var id = findUniqueSource(sources, miners);

                if (energy == 200) {
                    body = [WORK, MOVE, MOVE];
                }
                else {
                    body = [WORK, WORK, WORK, WORK, WORK, MOVE, MOVE];
                }
                console.log('Spawning new ' + roleName + ' creep: ' + cName);
                return this.createCreep(body, cName, {role: roleName, assignedSource: id});
            }

            else if (roleName == 'melee') {
                var numParts = Math.floor(energy / 140);
                for (let i = 0; i < numParts; i++) {
                    body.push(TOUGH)
                }
                for (let i = 0; i < numParts; i++) {
                    body.push(ATTACK);
                    body.push(MOVE);
                }
                console.log('Spawning new ' + roleName + ' creep: ' + cName);
                return this.createCreep(body, cName, {role: roleName, flagged: false});
            }

            else if (roleName == 'ranger') {
                var numParts = Math.floor(energy / 210);
                for (let i = 0; i < numParts; i++) {
                    body.push(TOUGH)
                }
                for (let i = 0; i < numParts; i++) {
                    body.push(RANGED_ATTACK);
                    body.push(MOVE);
                }
                console.log('Spawning new ' + roleName + ' creep: ' + cName);
                return this.createCreep(body, cName, {role: roleName, flagged: false});
            }

            else {
                var numParts = Math.floor(energy / 200);
                for (let i = 0; i < numParts; i++) {
                    body.push(WORK);
                }
                for (let i = 0; i < numParts; i++) {
                    body.push(CARRY);
                }
                for (let i = 0; i < numParts; i++) {
                    body.push(MOVE);
                }
                console.log('Spawning new ' + roleName + ' creep: ' + cName);
                return this.createCreep(body, cName, {role: roleName, working: false});
            }
        }
}


module.exports = Room;

function findUniqueSource (sources, miners) {
    if (miners == undefined) {
        return Game.spawns.Alpha.pos.findClosestByPath(FIND_SOURCES).id
    }
    for (var source of sources) {
        for (let miner of miners) {
            if (miner.memory.assignedSource != source.id) {
                return source.id;
            }
        }
    }
    return source.id;
}
