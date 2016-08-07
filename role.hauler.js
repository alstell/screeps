var roleHauler;
roleHauler = {

    /** @param {Creep} creep **/
    run: function (creep) {

        var droppedEnergy = creep.pos.findClosestByPath(creep.pos.findInRange(FIND_DROPPED_ENERGY, 5));

        if (droppedEnergy != undefined && creep.carry.energy < creep.carryCapacity) {
            if (creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
                creep.moveTo(droppedEnergy);
            }
        }
        if (creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        else if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if (creep.memory.working) {
            let target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (s) => {
                    return (s.structureType == STRUCTURE_SPAWN && s.energy < s.energyCapacity);
                }
            });

            if (!target) {
                target = _.filter(creep.room.controller.pos.findInRange(FIND_STRUCTURES, 5),
                    (s) => (s.structureType == STRUCTURE_CONTAINER && _.sum(s.store) < s.storeCapacity));
                target = creep.pos.findClosestByPath(target);
            }

            /*           if (!target) {
             target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
             filter: (structure) => {
             return (structure.structureType == STRUCTURE_STORAGE ||
             (structure.structureType == STRUCTURE_LINK && structure.energy < structure.energyCapacity));
             }
             });
             }
             */
            if (!target) {
                target = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
                    filter: (c) => {
                        return (_.sum(c.carry) < c.carryCapacity && c != creep && c.memory.role != 'harvester')
                    }
                });
            }

            if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
        else {
            let droppedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_ENERGY, {
                filter: (e) => {
                    return (e.energy > 0.25 * (creep.carryCapacity - _.sum(creep.carry)))
                }
            });

            if (droppedEnergy && creep.carry.energy < creep.carryCapacity) {
                if (creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(droppedEnergy);
                }
            }
            else {
                let source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => {
                        return s.structureType == STRUCTURE_STORAGE
                            && s.store[RESOURCE_ENERGY] >= 0
                    }
                });

                if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
            }
        }
    }
};

module.exports = roleHauler;
