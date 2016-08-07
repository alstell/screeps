var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        var droppedEnergy = creep.pos.findClosestByPath(creep.pos.findInRange(FIND_DROPPED_ENERGY, 5 ));

        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if (droppedEnergy != undefined && creep.carry.energy < creep.carryCapacity) {
            if (creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
                creep.moveTo(droppedEnergy);
            }
        }

        else if(creep.memory.working) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
        else {
            let droppedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_ENERGY, {
                filter: (e) => {return (e.energy > 0.25 * (creep.carryCapacity - _.sum(creep.carry)))}
            });

            if (droppedEnergy  && creep.carry.energy < creep.carryCapacity ) {
                if (creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(droppedEnergy);
                }
            }
            else {
                var source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => {
                        return (s.structureType == STRUCTURE_STORAGE && s.store[RESOURCE_ENERGY] > 0) ||
                            (s.structureType == STRUCTURE_LINK && s.energy > 0 ) ||
                            (s.structureType == STRUCTURE_CONTAINER &&
                            s.store[RESOURCE_ENERGY] > 0.8 * (creep.carryCapacity - _.sum(creep.carry)))
                    }
                });

                if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
            }
        }
    }
};

module.exports = roleUpgrader;