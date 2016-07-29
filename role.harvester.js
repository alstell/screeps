var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {

        var droppedEnergy = creep.pos.findClosestByPath(creep.pos.findInRange(FIND_DROPPED_ENERGY, 1 ));

        if (droppedEnergy != undefined && creep.carry.energy < creep.carryCapacity) {
            if (creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
                creep.moveTo(droppedEnergy);
            }
        }

        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        else if(!creep.memory.working && creep.carry.energy == creep.carryCapacity ) {
            creep.memory.working = true;
        }

        if (creep.memory.working) {
            let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
        }
        });
            if (!target) {
                target = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
                    filter: (c) => {
                        return (_.sum(c.carry) < c.carryCapacity && c != creep && c.memory.role != 'hauler')
                }
                });
            }

            if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
        else {
            var source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] > 0)
                      || (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY]));
                }
            });
            if(creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                if (creep.carry.energy > 0) {
                    let target = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {
                        filter: (s) => (s).structureType == STRUCTURE_EXTENSION
                    });
                    if(target.length > 0) creep.transfer(target[0], RESOURCE_ENERGY);
                }
                creep.moveTo(source);
            }
        }
    }
};

module.exports = roleHarvester;
