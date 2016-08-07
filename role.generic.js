var roleUpgrader = require('role.upgrader');

var roleGeneric = {

    /** @param {Creep} creep **/
    run: function(creep) {

        //Context switching
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        // Working context
        if(creep.memory.working) {

            let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => {
                    return (s.structureType == STRUCTURE_SPAWN && s.energy < s.energyCapacity)
                }
            });

            if (!target) {
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => {
                        return (s.structureType == STRUCTURE_EXTENSION && s.energy < s.energyCapacity )
                    }
                });
            }

            if (target) {
                if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    let target2 = creep.pos.findInRange(FIND_MY_STRUCTURES, 2, {
                        filter: (s) => s.structureType == STRUCTURE_EXTENSION
                    });

                    if(target2.length > 0) creep.transfer(target2[0], RESOURCE_ENERGY);
                    creep.moveTo(target);
                }
            }
            else {
                roleUpgrader.run(creep);
            }
        }

        // Not-Wotking Context
        else {
            let droppedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_ENERGY, {
                filter: (e) => {
                    return (e.energy > 0.25 * (creep.carryCapacity - _.sum(creep.carry)))
                }
            });

            if (droppedEnergy && creep.carry.energy < creep.carryCapacity) {
                console.log(creep.name + ' found ' + droppedEnergy.energy + ' dropped energy at ' + droppedEnergy.pos);
                if (creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(droppedEnergy);
                }
            }
            else {
                let source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    if (creep.carry.energy > 0) {
                        let target = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {
                            filter: (s) => s.structureType == STRUCTURE_EXTENSION
                        });

                        if (target.length > 0) creep.transfer(target[0], RESOURCE_ENERGY);
                    }
                    creep.moveTo(source);
                }
            }
        }
    }
};

module.exports = roleGeneric;