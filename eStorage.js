//////////////////////////////////////////////////////////////////
//                      Module: eStorage                        //
//                                                              //
//  Purpose:    Manages storage deposits                        //
//                                                              //
//  Last Modified:  07/20/16                                    //
//                                                              //
//  Functions:  eStorage - Initializes all of the energy        //
//                  storage structures in the room that can     //
//                  be used for depositing energy               //
//                                                              //
//  Prototypes: getSpawnDeposit - returns the spawn in the      //
//                  least amount of energy. Will return a       //
//                  falsy value if there is no deposit or if    //
//                  spawns are full.                            //
//              getEmptyExtensions - caches any extensions      //
//                  that are less than EMPTY_LEVEL full         //
//              isEmptyExtension - returns true is passed       //
//                  extension is less than EMPTY_LEVEL full     //
//              getEmptyExtensionOnId -  returns am empty       //
//                  extension from the passed object id         //
//              getClosestEmptyStore - returns the closest      //
//                  energy storage structure to the requesting  //
//                  creep. In order; extensions, spawns and     //
//                  then storage.                               //
//              energy - cache the energy in all of the         //
//                  extensions in the room                      //
//
//////////////////////////////////////////////////////////////////
var Cache = require('Cache');
var CONSTS = {
	EMPTY_LEVEL: 0.5
};

function eStorage(room) {
	this.cache = new Cache();
	this.room = room;

	// Extensions
    this.extensions = this.room.find( FIND_STRUCTURES, {
	    filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION)
	    }
    });

    // Storage
    this.stores = this.room.find(FIND_STRUCTURES, {
        filter: (structures) => {
            return (structures.structureType == STRUCTURE_STORAGE)
        }
    });

	// Spawns
    this.spawns = [];
	for(let name in Game.spawns) {
		if (Game.spawns.hasOwnProperty(name)) {
            let spawn = Game.spawns[name];
            if (spawn.room == this.room) {
                this.spawns.push(spawn);
            }
        }
	}
}

eStorage.prototype.getSpawnDeposit = function() {
	if(this.spawns.length != 0) {
	    let lowEnergy = 300;
        let lowSpawn = undefined;
	    for(let spawn in Game.spawns) {
	        if(Game.spawns.hasOwnProperty(spawn)) {
	            if (spawn.energy < lowEnergy) {
	                lowEnergy = spawn.energy;
                    lowSpawn = spawn;
                }
            }
        }
		return lowSpawn
	}
	return false;
};

eStorage.prototype.getEmptyExtensions = function() {
	return this.cache.remember(
		'empty-extensions',
		function() {
			var empty = [];
			for(let i = 0; i < this.extensions.length; i++) {
				let res = this.extensions[i];
				if(this.isEmptyExtension(res)) {
					empty.push(res);
				}
			}
			return empty;
		}.bind(this)
	);
};

eStorage.prototype.isEmptyExtension = function(ext) {
	if(ext.energy / ext.energyCapacity < CONSTS.EMPTY_LEVEL) {
		return true;
	}
	return false;
};

eStorage.prototype.getEmptyExtensionOnId = function(id) {
	var extension = Game.getObjectById(id);

	if(extension && this.isEmptyExtension(extension)) {
		return extension;
	}
	return false;
};

eStorage.prototype.getClosestEmptyStore = function(creep) {
	var eDumps = this.getEmptyExtension();
	var store = false;
	if(eDumps.length != 0) store = creep.pos.findClosestByPath(eDumps);

    if (!store) store = this.getSpawnDeposit();

    if (!store) store = this.stores[0];

    return store;
};

eStorage.prototype.energy = function() {
	return this.cache.remember(
		'storage-energy',
		function() {
		    return this.room.energyAvailable;
        }.bind(this)
	);
};

eStorage.prototype.energyCapacity = function() {
	return this.cache.remember(
		'storage-energy-capacity',
        function() {
		    return this.room.energyCapacityAvailable;
        }.bind(this)

	);
};

eStorage.prototype.getFullExtensions = function() {
	return this.cache.remember(
		'storage-full',
		function() {
			var full = [];
			var deposits = this.extensions;
			for(var i = 0; i < deposits.length; i++) {
				var deposit = deposits[i];
				if(deposit.energy == deposit.energyCapacity) {
					full.push(deposit);
				}
			}
			return full;
		}.bind(this)
	);
};


module.exports = eStorage;
