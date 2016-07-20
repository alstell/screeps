//////////////////////////////////////////////////////////////////
//                      Module: RoomHandler                    //
//                                                              //
//  Purpose:    Functions to manage any rooms I have a          //
//              presence in                                     //
//                                                              //
//  Functions:  set - sets up the rooms and handler hashes      //
//              get - returns roomHandler object if the room    //
//                  belongs to us                               //
//              isOurRoom - reutrns true is the controller      //
//                  belongs to us, false if not                 //
//              getRoomHandlers - returns a hash of all the     //
//                  room handlers                               //
//              requestReinforcement - not sure how it works?   //
//                  Really not sure wher the senReinforcements  //
//                  function is from.                           //
//                                                              //
//////////////////////////////////////////////////////////////////

var rooms = [];
var roomHandlers = {};
var RoomHandler = {};

RoomHandler.set = function(name, handler) {
    rooms.push(name);
    roomHandlers[name] = handler;
};

RoomHandler.get = function(name) {
    return this.isOurRoom(name) ? roomHandlers[name] : false;

};

RoomHandler.isOurRoom = function(name) {
    return !!Game.rooms[name].controller.my;
};

RoomHandler.getRoomHandlers = function() {
    return roomHandlers;
};

RoomHandler.requestReinforcement = function(room) {
    var rooms = this.getRoomHandlers();
    for(var n in rooms) {
        var r = rooms[n];
        if(r.room.name != room.room.name) {
            r.sendReinforcements(room);
        }

    }
};

module.exports = RoomHandler;
