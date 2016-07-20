var roleMelee = {

    /** @param {Creep} creep **/
    run: function(creep) {

        var flagName = Game.flags.Defend;

        // Move to the flag in another room

        if (creep.pos.isEqualTo(flagName)) {
            creep.memory.flagged = true;
        }

        if (creep.memory.flagged) {
            // Code goes here to defeend against attacking creeps
        }
        else {
            creep.moveTo(flagName);
        }
    }
};

module.exports = roleMelee;