//////////////////////////////////////////////////////////////////////
//      Module:     Resources                                       //
//                                                                  //
//      Purpose: Find energy resources in a room (expand later to 	//
//          also manage elemental resources.                        //
//                                                                  //
//      Last Modified: 07/20/2016                                   //
//                                                                  //
//      Functions:                                                  //
//      Resources: initialize resources object . room object and    //
//          population object are passed in.                        //
//                                                                  //
//      Prototypes:                                                 //
//      .getAvailableResource: returns a random source in the room  //
//      .getResourceById: returns the resource object for a given id//
//      .getSources: caches the active sources in a room that don't //
//          have hostile creeps within 3 blocks.                    //
//                                                                  //
//      To Do: Need to add a prototype to find the number of open   //
//          spots around a source                                   //
//////////////////////////////////////////////////////////////////////
var Cache = require('Cache');

function Resources(room, population) {
	this.cache = new Cache();
	this.room = room;
	this.population = population;
}

Resources.prototype.getAvailableResource = function() {
	// Some kind of unit counter per resource (with Population)
	var srcs = this.getSources();
	var srcIndex = Math.floor(Math.random()*srcs.length);

	return srcs[srcIndex];
};
Resources.prototype.getResourceById = function(id) {
	return Game.getObjectById(id);
};
Resources.prototype.getSources = function(room) {
	return this.cache.remember(
		'sources',
		function() {
			return this.room.find(
				FIND_SOURCES, {
					filter: function(src) {
						var targets = src.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
                        return targets.length == 0;

                    }
				}
			);
		}.bind(this)
	);
};

module.exports = Resources;
