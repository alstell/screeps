var roleHauler = require('role.hauler');
var roleMiner = require('role.miner');

var roleBuilder2 = {

    /** @param {Creep} creep **/
    run: function(creep) {

        var droppedEnergy = creep.pos.findInRange(FIND_DROPPED_ENERGY, 5 );

        var flagName = Game.flags.Build;


        if (droppedEnergy != undefined && creep.carry.energy < creep.carryCapacity) {
            if (creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
                creep.moveTo(droppedEnergy);
            }
        }
        // Move to the flag in another room

        if (creep.pos.isEqualTo(flagName)) {
            creep.memory.flagged = true;
        }

        if (!creep.memory.flagged) {
                creep.moveTo(flagName);
            }
        else if (creep.memory.flagged) {
            if(creep.memory.working && creep.carry.energy == 0) {
                creep.memory.working = false;
            }

            if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
                creep.memory.working = true;
            }

            if(creep.memory.working) {
                var target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);

                if (target != undefined) {
                    if (creep.build(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                }
                else {
                        roleHauler.run(creep);
                }
            }
            else {
                var source = creep.pos.findClosestByPath(FIND_SOURCES);
            }
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        }
    }
};

module.exports = roleBuilder2;