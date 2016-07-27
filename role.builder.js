var roleRepairer = require('role.repairer');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

        var droppedEnergy = creep.pos.findInRange(FIND_DROPPED_ENERGY, 5 );

        if (droppedEnergy != undefined && creep.carry.energy < creep.carryCapacity) {
            if (creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
                creep.moveTo(droppedEnergy);
            }
        }

        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if(creep.memory.working) {
            var target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            var lowRamp = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (structure) => {
                return (structure.structureType == STRUCTURE_RAMPART && structure.hits < 10000)}
            });

            if (target != undefined) {
                if (creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }

            else if (lowRamp != undefined) {
                if (creep.repair(lowRamp) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(lowRamp);
                }
            }
                
            else {
                roleRepairer.run(creep);
            }
        }
        else {
            var source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] > 0) ||
                    (structure.structureType == STRUCTURE_CONTAINER && structure.energy > creep.carryCapacity)||
                    (structure.structureType == STRUCTURE_LINK && structure.energy > 0 ))
                }
            });
            if(creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        }
    }
};

module.exports = roleBuilder;