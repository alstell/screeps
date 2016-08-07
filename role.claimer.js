var roleClaimer = {

    /** @param {Creep} creep **/
    run: function(creep) {

        var flagName = creep.memory.flag;

        // Move to the flag in another room

        if (creep.pos.isEqualTo(Game.flags[flagName.name])) {
            creep.memory.flagged = true;
        }

        if (creep.memory.flagged) {
            if (creep.room.controller && !creep.room.controller.my) {
                if (creep.attackController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
                else if(creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            }
        }
        else {
            creep.moveTo(Game.flags[flagName.name]);
        }
    }
};

module.exports = roleClaimer;

