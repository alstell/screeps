

module.exports = function() {
    StructureSpawn.prototype.createCustomCreep =
        function (energy, roleName, room) {
            var body = [];
            var cName = _.capitalize(roleName) + '_' + _.padLeft(new Date().getMinutes(), 2, '0');



            if (roleName == 'claimer') {
                var numClaim = Math.floor((energy - 100) / 600);
                var numMove = Math.floor((energy - numClaim * 600) / 50);

                for (let i = 0; i < numClaim; i++) {
                    body.push(CLAIM);
                }
                for (let i = 0; i < numMove; i++) {
                    body.push(MOVE);
                }
                console.log ('Spawning new ' + roleName + ' creep: ' + cName);
                console.log ('Energy: ' + energy);
                return this.createCreep(body, cName, {role: roleName, flagged: false});
            }
            else if (roleName == 'miner'){
                var sources = Game.spawns[room].room.find(FIND_SOURCES);
                var miners = _.filter(Game.spawns[room].room.find(FIND_MY_CREEPS), (creep) => creep.memory.role == 'miner');
                var id = findUniqueSource(sources, miners);

                if (energy == 200){
                    body = [WORK, MOVE,MOVE];
                }
                else { body = [WORK,WORK,WORK,WORK,WORK,MOVE,MOVE];
                }
                console.log (room +': Spawning new ' + roleName + ' creep: ' + cName);
                return this.createCreep(body, cName, {role: roleName, assignedSource: id});
                }

            else if (roleName == 'melee'){
                let numParts = Math.floor(energy/140);
                for (let i = 0; i < numParts; i++) {
                    body.push(TOUGH)
                }
                for (let i = 0; i < numParts; i++) {
                    body.push(ATTACK);
                    body.push(MOVE);
                }
                console.log (room +':Spawning new ' + roleName + ' creep: ' + cName);
                return this.createCreep(body, cName, {role: roleName, flagged: false});
            }

            else if (roleName == 'ranger'){
                let numParts = Math.floor(energy/210);
                for (let i = 0; i < numParts; i++) {
                    body.push(TOUGH)
                }
                for (let i = 0; i < numParts; i++) {
                    body.push(RANGED_ATTACK);
                    body.push(MOVE);
                }
                console.log (room +':Spawning new ' + roleName + ' creep: ' + cName);
                return this.createCreep(body, cName, {role: roleName, flagged: false});
            }

            else {
                var numParts = Math.floor(energy / 200);
                for (let i = 0; i < numParts; i++) {
                    body.push(WORK);
                }
                for (let i = 0; i < numParts; i++) {
                    body.push(CARRY);
                }
                for (let i = 0; i < numParts; i++) {
                    body.push(MOVE);
                }
                console.log (room +':Spawning new ' + roleName + ' creep: ' + cName);
                return this.createCreep(body, cName, {role: roleName, working: false});
            }
        }
};

function findUniqueSource (sources, miners) {
    if (miners == undefined) {
        return spawnGame.spawns[room].room.pos.findClosestByPath(FIND_SOURCES).id
    }
    for (var source of sources) {
        for (let miner of miners) {
            if (miner.memory.assignedSource != source.id) {
                return source.id;
            }
        }
    }
    return source.id;
}

/*findSources: function(room) {
 if (!room.memory.sources)
 room.memory.sources = [];
 ​
 room.memory.sources = [];
 ​
 var sources = room.find(FIND_SOURCES);
 for (var key in sources) {
 let source = sources[key];
 let harvestPosAvailable = 0;
 let harvestLoc;
 for (let x = -1; x < 2; x++) {
 for (let y = -1; y < 2; y++) {
 let typeOfMap = Game.map.getTerrainAt(source.pos.x - x, source.pos.y - y, room.name)
 if (typeOfMap != 'wall') {
 if (!harvestLoc) {
 harvestLoc = room.getPositionAt(source.pos.x - x, source.pos.y - y)
 }
 harvestPosAvailable++
 }
 }
 }
 let packedSource = {
 id: source.id,
 harvestPos: harvestLoc,
 harvestPosAvailable: parseInt(harvestPosAvailable * 1.5),
 assignedCreeps: []
 };
 ​
 room.memory.sources.push(packedSource);
 }
 }
    */