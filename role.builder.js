var roleRepairer = require('role.repairer');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

        // var startCpu = Game.cpu.getUsed();

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
            let droppedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_ENERGY, {
                filter: (e) => {return (e.energy > 0.25 * (creep.carryCapacity - _.sum(creep.carry)))}
            });

            if (droppedEnergy  && creep.carry.energy < creep.carryCapacity ) {
                if (creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(droppedEnergy);
                }
            }
            else {
                let source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => {
                        return (s.structureType == STRUCTURE_STORAGE && s.store[RESOURCE_ENERGY] > 0)
                    }
                });

                if (!source) {
                    source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (s) => {
                            return (s.structureType == STRUCTURE_CONTAINER &&
                            s.store[RESOURCE_ENERGY] > 0.4 * (creep.carryCapacity - _.sum(creep.carry)))
                        }
                    });
                }

                if (!source) {
                    source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (s) => {
                            return (s.structureType == STRUCTURE_LINK && s.energy > 0)
                        }
                    });
                }

                if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
            }
        }
        // var elapsed = (Game.cpu.getUsed() - startCpu).toFixed(2);
       // console.log(creep.name + ' used ' + elapsed +' CPU time.');
    }
};

module.exports = roleBuilder;