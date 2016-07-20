var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        var droppedEnergy = creep.pos.findClosestByPath(creep.pos.findInRange(FIND_DROPPED_ENERGY, 5 ));

        if (droppedEnergy != undefined && creep.carry.energy < creep.carryCapacity) {
            if (creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
                creep.moveTo(droppedEnergy);
            }
        }
        var flagName = Game.flags.New;

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
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            }

            else {
                var source = creep.pos.findClosestByPath(FIND_SOURCES);
                if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
            }
        }
    }
};

module.exports = roleUpgrader;