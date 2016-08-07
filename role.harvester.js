var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {

       // var startCpu = Game.cpu.getUsed();

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
                target = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_STORAGE)
                    }
                });
                target = target[0];
            }

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
                filter: (e) => {return (e.energy > 0.25 * (creep.carryCapacity - _.sum(creep.carry)))}
            });

            if (droppedEnergy  && creep.carry.energy < creep.carryCapacity ) {
                if (creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(droppedEnergy);
                }
            }
            else {
                let source = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: (s) => (s.structureType == STRUCTURE_LINK && s.energy > 0)
                });

                if (!source) source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) =>(s.structureType == STRUCTURE_CONTAINER &&
                    s.store[RESOURCE_ENERGY]) > 0.5 * (creep.carryCapacity - _.sum(creep.carry))
                });

                if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    if (creep.carry.energy > 0) {
                        let target = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {
                            filter: (s) => (s).structureType == STRUCTURE_EXTENSION ||
                            (s).structureType == STRUCTURE_STORAGE
                        });
                        if (target.length > 0) creep.transfer(target[0], RESOURCE_ENERGY);
                    }
                    creep.moveTo(source);
                }
            }
        }
       // var elapsed = (Game.cpu.getUsed() - startCpu).toFixed(2);
      //  console.log(creep.name + ' used ' + elapsed +' CPU time.');
    }
};

module.exports = roleHarvester;
