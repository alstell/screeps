//////////////////////////////////////////////////////////////////////
//      Module:     Room                                            //
//                                                                  //
//      Purpose: Room management for each controlled room           //
//      Last Modified: 07/19/2016                                   //
//      Functions:                                                  //
//      Room: calls all of the modules to load objects and init the //
//          room                                                    //
//      Prototypes:                                                 //
//      .askForReinforcements: Room requests reinfordements from    //
//          roomHandler                                             //
//      .sendReinforcements: initializes memory for the room and    //
//          calls for reinforcements if room population does not    //
//          have at least one miner and one hauler send startup     //
//          crew. (This needs work)                                 //
//      .populate: determine how many creeps of each type are       //
//          needed in a given room and request new creeps be built  //
//                                                                  //
//////////////////////////////////////////////////////////////////////
var Population = require('Population');
var EnergyStorage = require('eStorage');
var Resources = require('Resources');
var Constructions = require('Constructions');

function Room(room, roomHandler) {
    this.room = room;
    this.roomHandler = roomHandler;
    this.creeps = [];
    this.structures = [];

    this.population = new Population(this.room);
    this.storageManager = new EnergyStorage(this.room);
    this.resourceManager = new Resources(this.room, this.population);
    this.constructionManager = new Constructions(this.room);

    // The number of miners should be determined by the number of open positions around all sources,
    // their bodies might be determined by 5 work/ number of positions rounded up (or it should always be 2)
    this.population.typeDistribution.miner.max = 2;

    // This number really should be determined by the length of the path from the source to the spawn.
    this.population.typeDistribution.hauler.max =  this.population.typeDistribution.miner.max * 2;


 //   var newName = BodyBuilder(room, 'miner', 800);
 //   console.log (newName);
}

module.exports = Room;

function BodyBuilder(room, roleName, energy) {
    var body = [];
    var cName = _.capitalize(roleName) + '_' + _.padLeft(new Date().getMinutes(), 2, '0');
    availableEnergy = energy;

    console.log(room.name + ': '+ cName + ' - ' + availableEnergy + ' E.U.');
}