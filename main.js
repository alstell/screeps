//New module imports
var RoomHandler = require('RoomHandler');
var Room = require('Room');

// Module imports
require ('prototype.spawn') ();

var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleUpgrader2 = require('role.upgrader2');
var roleBuilder = require('role.builder');
var roleBuilder2 = require('role.builder2');
var roleRepairer = require('role.repairer');
var roleRepairer2 = require('role.repairer2');
var roleMaintainer = require('role.maintainer');
var roleClaimer = require('role.claimer');
var roleMiner = require('role.miner');
var roleHauler = require('role.hauler');
var roleMelee = require('role.melee');
var roleRanger = require('role.ranger');

// Set minimum number of creeps
var minHarvester = 1;
var minUpgrader = 2;
var minUpgrader2 = 1;
var minBuilder = 0;
var minBuilder2 = 1;
var minRepairer = 1;
var minRepairer2 = 1;
var minMaintainer = 1;
var minClaimers = 1;
var minHaulers = 2;
var minMelee = 0;
var minRangers = 0;
var mySpawns = Game.spawns;
var Sources = Game.spawns.Alpha.room.find(FIND_SOURCES);
var minMiners = Sources.length;

// Variable definitions
var newName = undefined;
var logged = undefined;


module.exports.loop = function () {

   // Set up rooms **** New ****
    for (let roomName in Game.rooms) {
        if (Game.rooms.hasOwnProperty(roomName)) {
            var roomHandler = new Room(Game.rooms[roomName], RoomHandler);
            RoomHandler.set(roomName, roomHandler)
        }
    }

    // Load Room **** New ****
    var rooms = RoomHandler.getRoomHandlers();
    for (let roomName in rooms) {
        if (rooms.hasOwnProperty(roomName)){
            let room = rooms[roomName];
            // room.loadCreeps();
            // room.populate();

                console.log( '['+Game.time+'] ' + room.room.name + ' | ' +
                    'goals met: ' + room.population.goalsMet() +
                    ', population: ' + room.population.getTotalPopulation() +
                    ' / ' + room.population.getMaxPopulation()  +
                    ' (m:' + room.population.getType('miner').total +
                    '/h:' + room.population.getType('hauler').total +
                    '/b:' + room.population.getType('builder').total +
                    '/r:' + room.population.getType('repairer').total +
                    '/u:' + room.population.getType('upgrader').total +
                    '), ' +
                    'Extension: ' + room.storageManager.extensions.length +
                    ', Spawns: ' + room.storageManager.spawns.length +
                    ', Stores: ' + room.storageManager.stores.length +
                    ', Energy: ' + parseInt((room.storageManager.energy() / room.storageManager.energyCapacity() ) *100) + '%, ' +

                    ' next death in ' + room.population.getNextExpectedDeath() +' ticks.'
                );
        }
    }
    console.log();

    // Tower defense - this code needs to move to a module and be generalized!
    var towers = Game.spawns.Alpha.room.find(FIND_MY_STRUCTURES, {
        filter: {structureType: STRUCTURE_TOWER }
    });

    for (let tower of towers) {
        var targetEnemy = tower.pos.findClosestByRange(tower.pos.findInRange(FIND_HOSTILE_CREEPS, 15 ));
        var damagedCreep = tower.pos.findClosestByRange(tower.pos.findInRange(FIND_MY_CREEPS, 15, {
            filter: (c) => c.hits < c.hitsMax
        }));
        var damagedStruc = tower.pos.findClosestByRange(tower.pos.findInRange(FIND_STRUCTURES, 12, {
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

    // Fire off From Link
    var myFromLink = Game.spawns.Alpha.room.lookForAt('structure', 21, 26)[0];
    var myToLink = Game.spawns.Alpha.room.lookForAt('structure', 8, 15)[0];
    if (myFromLink && myToLink){
        if ((myFromLink.cooldown == 0) && (myToLink.energy <= 0) && (myFromLink.energy == myFromLink.energyCapacity)) {
            console.log("TRANSFERING ENERGY VIA LINK");
            myFromLink.transferEnergy(myToLink);
        }
    }

    // Create an array of each type of creep
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    var upgraders2 = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader2');
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    var builders2 = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder2');
    var repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');
    var repairers2 = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer2');
    var maintainers = _.filter(Game.creeps, (creep) => creep.memory.role == 'maintainer');
    var claimers = _.filter(Game.creeps, (creep) => creep.memory.role == 'claimer');
    var melees = _.filter(Game.creeps, (creep) => creep.memory.role == 'melee');
    var rangers = _.filter(Game.creeps, (creep) => creep.memory.role == 'ranger');
    var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');
    var haulers = _.filter(Game.creeps, (creep) => creep.memory.role == 'hauler');
    var energyCap = Game.spawns.Alpha.room.energyCapacityAvailable;
    var energy = Game.spawns.Alpha.room.energyAvailable;
    if (energyCap > 800) energyCap = 800;


    // Clean memory of dead creeps
    for(let dead in Memory.creeps) {
        if(!Game.creeps[dead]) {
            console.log(dead + ' died. Removing creep from memory.');
            // logCreeps();
            logged = false;
            delete Memory.creeps[dead];
        }
    }

    if (miners.length == 0) {
        newName = Game.spawns.Alpha.createCustomCreep(200, 'miner');
    }
    else if (haulers.length == 0) {
        newName = Game.spawns.Alpha.createCustomCreep(200, 'hauler');
    }
    else if (harvesters.length == 0 && energy >= 300 && energy < 600) {
        newName = Game.spawns.Alpha.createCustomCreep(energy, 'harvester');
    }
    else if (miners.length < minMiners && energy >= 600 ) {
        newName = Game.spawns.Alpha.createCustomCreep(energyCap, 'miner');
    }
    else if (haulers.length < minHaulers && energy >= energyCap) {
        newName = Game.spawns.Alpha.createCustomCreep(energyCap, 'hauler');
    }
    else if(harvesters.length < minHarvester && energy >= 600) {
        newName = Game.spawns.Alpha.createCustomCreep(energyCap, 'harvester');
    }
    else if (builders2.length < minBuilder2 && energy >= energyCap) {
        newName = Game.spawns.Alpha.createCustomCreep(energyCap, 'builder2');
    }
    else if (repairers2.length < minRepairer2 && energy >= energyCap) {
        newName = Game.spawns.Alpha.createCustomCreep(energyCap, 'repairer2');
    }
    else if (upgraders2.length < minUpgrader2 && energy >= energyCap){
        newName = Game.spawns.Alpha.createCustomCreep(energyCap, 'upgrader2');
    }
    else if (upgraders.length < minUpgrader && energy >= energyCap){
        newName = Game.spawns.Alpha.createCustomCreep(energyCap, 'upgrader');
    }
    else if (claimers.length < minClaimers && energy >= 700) {
        newName = Game.spawns.Alpha.createCustomCreep(energy, 'claimer');
    }
    else if (builders.length < minBuilder && energy >= energyCap) {
        newName = Game.spawns.Alpha.createCustomCreep(energyCap, 'builder');
    }
    else if (repairers.length < minRepairer && energy >= energyCap) {
        newName = Game.spawns.Alpha.createCustomCreep(energyCap, 'repairer');
    }
    else if (maintainers.length < minMaintainer && energy >= energyCap) {
        newName = Game.spawns.Alpha.createCustomCreep(energyCap, 'maintainer');
    }
    else if (melees.length < minMelee && energy >= energyCap) {
        newName = Game.spawns.Alpha.createCustomCreep(energyCap, 'melee');
    }

    // Assign creeps their jobs
    for(let name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        } else if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        } else if(creep.memory.role == 'upgrader2') {
            roleUpgrader2.run(creep);
        } else if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        } else if(creep.memory.role == 'builder2') {
            roleBuilder2.run(creep);
        } else if(creep.memory.role == 'repairer') {
            roleRepairer.run(creep);
        } else if(creep.memory.role == 'repairer2') {
            roleRepairer2.run(creep);
        } else if(creep.memory.role == 'maintainer') {
            roleMaintainer.run(creep);
        } else if(creep.memory.role == 'claimer') {
            roleClaimer.run(creep);
        } else if(creep.memory.role == 'melee') {
            roleMelee.run(creep);
        } else if(creep.memory.role == 'ranger') {
            roleMelee.run(creep);
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

