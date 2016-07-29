var roleBlocker = {

    /** @param {Creep} creep **/
    run: function(creep) {

        // Move to the flag in another room

        // Move to Muster
        if (creep.pos.isEqualTo(Game.flags.Muster) && !creep.memory.muster) creep.memory.muster = true;

        if (!creep.pos.isEqualTo(Game.flags.Muster) && !creep.memory.muster) creep.moveTo(Game.flags.Muster);

        if (creep.memory.muster && !creep.memory.flagged) creep.moveTo(Game.flags.Block);
    }

};

module.exports = roleBlocker;