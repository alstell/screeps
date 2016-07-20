//////////////////////////////////////////////////////////////////////
//      Module:     Population                                      //
//                                                                  //
//      Purpose: Determine information and status about creeps in   //
//                  a room                                          //
//      Last Modified: 07/19/2016                                   //
//      Functions:                                                  //
//      Population: initialize the distribution of creeps for a     //
//          room, count the total number of creeps of each type,    //
//          and determine the total percentage of each creep type   //
//                                                                  //
//      Prototypes:                                                 //
//      .goalsMet determines if current creep type distribution     //
//          meets the goal distribution for the room                //
//      .getType:  returns the population object of the passed      //
//          creep type                                              //
//      .getTypes:  returns an array containing all the types of    //
//          creeps                                                  //
//      .getTotalPopulation: returns the total number of creeps     //
//          in a room                                               //
//      .getMaxPopulation: cache the upper limit set in the         //
//          population hash for each creep type for a room.         //
//      .getNextExpectedDeath: caches the ticks until the next      //
//          creep death.                                            //
//                                                                  //
//////////////////////////////////////////////////////////////////////

var Cache = require('Cache');

function Population(room) {
    this.room = room;
    this.population = 0;            // Where is this used?
    this.populationMultiplier = 8;  // Where is this used and for what?
    this.typeDistribution = {
        miner: {
            total: 0,
            currentPercent: 0,
            max: 2,
            goalWeight: 0.2
        },
        builder: {
            total: 0,
            currentPercent: 0,
            max: 2,
            goalWeight: 0.2
        },
        hauler: {
            total: 0,
            currentPercent: 0,
            max: 4 ,
            goalWeight: 0.3
        },
        upgrader: {
            total: 0,
            currentPercent: 0,
            max: 2,
            goalWeight: 0.3
        },
        repairer: {
            total: 0,
            currentPercent: 0,
            max: 1,
            goalWeight: 0.2
        },
        maintainer: {
            total: 0,
            currentPercent: 0,
            max: 1,
            goalWeight: 0.2
        },
        melee: {
            total: 0,
            currentPercent: 0,
            max: 5,
            goalWeight: 0.25
        },
        ranger: {
            total: 0,
            currentPercent: 0,
            max: 3,
            goalWeight: 0.2
        },
        healer: {
            total: 0,
            currentPercent: 0,
            max: 2,
            goalWeight: 0.2
        },
        claimer: {
            total: 0,
            currentPercent: 0,
            max: 1,
            goalWeight: 0.15
        }

    };

    this.creeps = this.room.find(FIND_MY_CREEPS);

    for (let i = 0; i < this.creeps.length; i++) {
        this.typeDistribution[this.creeps[i].memory.role].total++;
    }

    for (let name in this.typeDistribution) {
        if (this.typeDistribution.hasOwnProperty(name)) {
            let type = this.typeDistribution[name];
            this.typeDistribution[name].currentPercent = type.total / this.getTotalPopulation();
        }
    }
}

Population.prototype.getTotalPopulation = function() {
    return this.creeps.length;
};

Population.prototype.getMaxPopulation = function() {
    return this.cache.remember (
        'max-population',
        function() {
            let population = 0;
            for(let name in this.typeDistribution) {
                if (this.typeDistribution.hasOwnProperty(name)) {
                    population += this.typeDistribution[name].max;
                }
            }
            return population;
        }.bind(this)
    );
};

Population.prototype.goalsMet = function() {
    for(let name in this.typeDistribution) {
        if (this.typeDistribution.hasOwnProperty(name)) {
            let type = this.typeDistribution[name];
            if((type.currentPercent < (type.goalWeight - type.goalWeight / 4) && type.total < type.max) ||
                type.total == 0 || type.total < type.max * 0.75) {
                return false;
            }
        }
    }
    return true;
};

Population.prototype.getNextExpectedDeath = function() {
    return this.cache.remember (
        'creep-ttl',
        function() {
            var ttl = 100000;

            for (let i = 0; i < this.creeps.length; i++) {
                let creep = this.creeps[i];

                if (creep.ticksToLive < ttl) {
                    ttl = creep.tickToLive;
                }
            }
            return ttl;
        }.bind(this)
    );
};

Population.prototype.getType = function(type) {
    return this.typeDistribution[type];
};

Population.prototype.getTypes = function() {
    let types = [];
    for (let name in this.typeDistribution) {
        if (this.typeDistribution.hasOwnProperty(name)) {
            types.push(name);
        }
    }
    return types;
};

module.exports = Population;

