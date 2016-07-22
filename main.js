//New module imports
var RoomHandler = require('RoomHandler');
var Room = require('Room');

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

    // Clean memory of dead creeps
    for(let dead in Memory.creeps) {
        if(!Game.creeps[dead]) {
            console.log(dead + ' died. Removing creep from memory.');
            // logCreeps();
            logged = false;
            delete Memory.creeps[dead];
        }
    }

    function logCreeps () {
        console.log('Miners: ' + miners.length + ' Haulers: ' + haulers.length + ' Harvesters: ' + harvesters.length +
            ' Upgraders: ' + upgraders.length + ' Claimers: ' + claimers.length + ' Builders: ' + builders.length +
            ' Repairers: ' + repairers.length + ' Maintainers: ' + maintainers.length);
    }
};

