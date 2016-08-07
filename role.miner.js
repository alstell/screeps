var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {

        // Move to assigned source and mine
        var assignedSource = Game.getObjectById(creep.memory.assignedSource);

        if (creep.harvest(assignedSource) == ERR_NOT_IN_RANGE) {
            creep.moveTo(assignedSource.pos);
        }

 /*       var structures = creep.pos.findInRange(FIND_STRUCTURES, 0, {
            filter: (s) => {
                return s.structureType == STRUCTURE_CONTAINER
            }
        });
        if (structures == "") {
            creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
        }
*/
    }
};

module.exports = roleMiner;

/*
 var makeCont = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES);
 if (makeCont.length > 0) {
 if (makeCont[0].structureType == 'container') {
 creep.build(makeCont[0]);
 let droppedEnergy = creep.pos.lookFor(LOOK_ENERGY);
 creep.pickup(droppedEnergy[0]);
 } else {
 makeCont[0].remove();
 creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
 }
 } else {
 creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
 }
 */