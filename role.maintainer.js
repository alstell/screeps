var roleRepairer = require('role.repairer');

var roleMaintainer = {

    /** @param {Creep} creep **/
    run: function(creep) {

 //       var startCpu = Game.cpu.getUsed();

        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

 if(creep.memory.working) {

            var target = undefined;

            for (let percentage = 0.0001; percentage <= 1; percentage = percentage + 0.0001){
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART) &&
                            structure.hits / structure.hitsMax < percentage;
                    }
                });

                if (target != undefined) {
                    break;
                }
            }

            if (target != undefined) {
                if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
            else {
                roleRepairer.run(creep);
            }
        }
        else {
            let droppedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_ENERGY, {
                filter: (e) => {return (e.energy > 0.25 * (creep.carryCapacity - _.sum(creep.carry)))}
            });

            if (droppedEnergy  && creep.carry.energy < creep.carryCapacity ) {
                if (creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(droppedEnergy);
                }
            }
            else {
                let source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] > 0);
                    }
                });
                if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
            }
        }
 //       var elapsed = (Game.cpu.getUsed() - startCpu).toFixed(2);
 //       console.log(creep.name + ' used ' + elapsed +' CPU time.');
    }

};

module.exports = roleMaintainer;

/*
Look at replaceing percentage code with something like this

 function getPercentWall(){
 switch(controllerLevel){
 case 2:
 return 20000;
 case 3:
 return 50000;
 case 4:
 return 250000;
 case 5:
 return 750000;
 case 6:
 return 2000000;
 case 7:
 return 150000000;
 case 8:
 return 300000000;
 default:
 return 1000;
 }
 }
 function getPercentRampart(){
 switch(controllerLevel){
 case 2:
 return 20000;
 case 3:
 return 50000;
 case 4:
 return 80000;
 case 5:
 return 110000;
 case 6:
 return 500000;
 case 7:
 return 1500000;
 case 8:
 return 3000000;
 default:
 return 1000;
 }
 }
 var targets = creep.room.find(FIND_STRUCTURES,
 {
 filter: function (structure) {
 var road = structure.structureType == STRUCTURE_ROAD && (structure.hits < (structure.hitsMax / 2));
 var wall = structure.structureType == STRUCTURE_WALL && ((structure.hits < getPercentWall()) && (structure.hits < structure.hitsMax));
 var rampart = structure.structureType == STRUCTURE_RAMPART && structure.hits < getPercentRampart();
 var container = structure.structureType == STRUCTURE_CONTAINER && (structure.hits < structure.hitsMax);
 return road || rampart || wall || container;
 }
 });

 */