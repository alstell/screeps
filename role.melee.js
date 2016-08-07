var roleMelee = {

    /** @param {Creep} creep **/
    run: function(creep) {

        // Move to the flag in another room

        // Move to Muster
        if (creep.pos.isEqualTo(Game.flags.Muster) && !creep.memory.muster) creep.memory.muster = true;

        if (!creep.pos.isEqualTo(Game.flags.Muster) && !creep.memory.muster) creep.moveTo(Game.flags.Muster);

        // Check to see if we are all here and move to attack flag
        if (creep.memory.muster && !creep.memory.attack) {
            let aCreeps = creep.pos.findInRange(FIND_MY_CREEPS, 3);
            if (aCreeps.length >= 1) creep.memory.attack = true;
        }

        if (creep.memory.attack && !creep.memory.flagged) creep.moveTo(Game.flags.Attack);

        if (creep.pos.isEqualTo(Game.flags.Attack) && !creep.memory.flagged) creep.memory.flagged = true;

        if (creep.memory.flagged && creep.memory.attack) {
            var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)

 //           var target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
 //               filter: (s) => s.structureType == STRUCTURE_TOWER
 //           });

            if (!target) target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

            if (!target) target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_SPAWN
            });

            if (!target) target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
                filter: (s) => s.structureType != STRUCTURE_CONTROLLER
            });

            if (target) {
                if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
        }
    }
};

module.exports = roleMelee;