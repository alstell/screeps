var roleClaimer2 = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if (Game.flags.Claim) {
            var flagName = Game.flags.Claim2;
        }

        // Move to the flag in another room

        if (creep.pos.isEqualTo(flagName)) {
            creep.memory.flagged = true;
        }

        if (creep.memory.flagged) {
            if (creep.room.controller && !creep.room.controller.my) {
                if (creep.attackController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
                else if(creep.reserveController(creep.room.controller) &&
                    creep.reserveController(creep.room.controller)== ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
                else if(creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            }
        }
        else {
            creep.moveTo(flagName);
        }
    }
};

module.exports = roleClaimer2;