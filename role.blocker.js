var roleBlocker = {

    /** @param {Creep} creep **/
    run: function(creep) {

        var target = undefined;

        // Move to the flag in another room

        // Move to Muster
        if (creep.pos.isEqualTo(Game.flags.Muster2) && !creep.memory.muster) creep.memory.muster = true;

        if (!creep.pos.isEqualTo(Game.flags.Muster2) && !creep.memory.muster) creep.moveTo(Game.flags.Muster2);

        if (!creep.memory.flagged) creep.moveTo(Game.flags.Block);

        if (creep.hits < creep.hitsMax) target = creep;

        if (!target) {
            target = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
                filter: function (object) {
                    return object.hits < object.hitsMax;
                }
            });
        }

        if(target) {
            if(creep.heal(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
    }

};

module.exports = roleBlocker;