//////////////////////////////////////////////////////////////////////
//      Module:     Constructions                                   //
//                                                                  //
//      Purpose: Find constructions and structures in a room        //
//                                                                  //
//      Last Modified: 07/21/2016                                   //
//                                                                  //
//      Functions:                                                  //
//          Constructions - Finds all construction sites, roads,    //
//              ramparts and structures as well as any damaged      //
//              structures.                                         //
//      Prototypes:                                                 //
//          .getDamagedStructures - Caches damaged structures that  //
//              are not wall or ramparts                            //
//          .getUpgradeStructures - Caches walls and ramparts not   //
//              at full hits. (This will probably be moved to       //
//              creep logic)                                        //
//          .getConstructionSiteById - input is an object ID return //
//              is the associated structure                         //
//          .getController - returns the controller for the room    //
//          .getClosestConstructionSite - returns the nearest       //
//              construction site to creep (relocate to creep logic)//
//          .repairStructure - repairs nearest damaged structure    //
//              to creep (relocate to creep logic)                  //
//                                                                  //
//////////////////////////////////////////////////////////////////////


var Cache = require('Cache');

function Constructions(room) {
    this.room = room;
    this.cache = new Cache();
    this.sites = this.room.find(FIND_CONSTRUCTION_SITES);
    this.structures = this.room.find(FIND_MY_STRUCTURES);
    this.roads = this.room.find(FIND_STRUCTURES, {filter: (r) => r.structureType == STRUCTURE_ROAD});
    this.damagedStructures = this.getDamagedStructures();
    this.controller = this.room.controller;
}

Constructions.prototype.getDamagedStructures = function() {
    return this.cache.remember(
        'damaged-structures',
        function() {
            return this.room.find(
                FIND_STRUCTURES,
                {
                    filter: function(s) {
                        var targets = s.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
						if(targets.length != 0) {
						    return false;
						}
                        if(s.hits < s.hitsMax * 0.8 && (s.structureType != STRUCTURE_RAMPART && s.structureType != STRUCTURE_WALL))
                        {
                            return true;
                        }
                    }
                }
            );
        }.bind(this)
    );
};

Constructions.prototype.getConstructionSiteById = function(id) {
    return this.cache.remember(
        'object-id-' + id,
        function() {
            return Game.getObjectById(id);
        }.bind(this)
    );
};

// Not sure the prototypes below here are needed

Constructions.prototype.getController = function() {
    return this.controller;
};

Constructions.prototype.getClosestConstructionSite = function(creep) {
    let site = false;
    if(this.sites.length != 0) {
        site = creep.pos.findClosestByPath(this.sites);
    }

    return site;
};


Constructions.prototype.repairStructure = function(creep) {

   if(this.damagedStructures.length != 0) {
       let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
           filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL
       });
       if (target != undefined) {
           if (creep.repair(target) == ERR_NOT_IN_RANGE) {
               creep.moveTo(target);
           }
       }
   }

    if(this.sites.length != 0) {
        let site = creep.pos.findClosestByPath(this.sites);
        if (creep.build(site) == ERR_NOT_IN_RANGE) {
            creep.moveTo(site);
        }
       return site;
    }

    if(this.upgradeableStructures.length != 0) {
        let site = creep.creep.pos.findClosestByPath(this.upgradeableStructures);
        if (creep.repair(site) == ERR_NOT_IN_RANGE) {
            creep.moveTo(site);
        }
        return site;
    }

    return false;
};


module.exports = Constructions;
