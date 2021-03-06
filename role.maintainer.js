var roleRepairer = require('role.repairer');

var roleMaintainer = {

    /** @param {Creep} creep **/
    run: function(creep) {

        var droppedEnergy = creep.pos.findInRange(FIND_DROPPED_ENERGY, 5 );

        if (droppedEnergy != undefined && creep.carry.energy < creep.carryCapacity) {
            if (creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
                creep.moveTo(droppedEnergy);
            }
        };

        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if(creep.memory.working) {


            var target = undefined;

            for (let percentage = 0.0001; percentage <= 1; percentage = percentage + 0.0001){
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART) &&
                            structure.hits / structure.hitsMax < percentage;
                    }
                });

                if (target != undefined) {
                    break;
                }
            }

            if (target != undefined) {
                if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
            else {
                roleRepairer.run(creep);
            }
        }
        else {
            var source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] > 0);
                }
            });
            if(creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        }
    }
};

module.exports = roleMaintainer;