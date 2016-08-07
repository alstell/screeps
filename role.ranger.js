var roleRanger = {

    /** @param {Creep} creep **/
    run: function(creep) {

        var flagName = Game.flags.Attack;

        // Move to the flag in another room

        if (creep.pos.isEqualTo(flagName)) {
            creep.memory.flagged = true;
        }

        if (creep.memory.flagged) {
            // Defense code goes here
        }
        else {
            creep.moveTo(flagName);
        }
    }
};

module.exports = roleRanger;