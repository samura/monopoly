(function () {
  'use strict';

  /**
   * service to play the game and
   */

  angular.module('monopoly').service('Game', ['Table', 'initialAmount', function(Table, initialAmount) {

    // players information
    var players = [
      { name: 'Jon (you)', isAI: false, color: 'success', piece: 'shopping-cart' },
      { name: 'AI', isAI: true, color: 'info', piece: 'camera' },
    ],
        // this should be moved to a translations file but, no time
        strings = {
          TURN: '%s turn',
          DICE: 'Move %s properties',
          LAND: 'Landed on %s',
          PAY: 'Paid $%s',
          BOUGHT: 'Bought %s',
          NOT_BOUGHT: 'Not enough funds to buy %s',
          BUILT: 'Built on %s',
          NOT_BUILT: 'Not enough funds to build on %s',
          CAN_BUILD: 'Can build in %s properties',
          PROPERTIES_HOUSE: 'Property has %s houses',
          SOLD_HOUSE: 'Sold building on %s',
          SOLD_PROPERTY: 'Sold %s',
          BROKE: 'Player %s is bankrupt!',
          PAY_BECAUSE: 'Paid because: %s'
        },
        // defined ths history
        history = [],
        // number of plays
        plays,
        // player playing now
        turn,
        // turn info available to the controller
        turnInfo
    ;

    /**
     * start the game
     */
    var init = function () {
      // player currently playing (random at first)
      turn = 0;
      plays = -1;
      turnInfo = {ready: true};

      // resets the players
      Table.init();

      // resets the owners
      players.forEach(function(player) {
        player.account = initialAmount;
        player.position = 0;
        player.properties = [];
      });

      // restarts history
      history.length = 0;
    };

    /**
     * Stars a play
     * @returns {object} Turn information
     */
    var play = function () {

      if(!turnInfo.ready) {
        return turnInfo;
      }

      plays++;
      turn = (turn+1 === players.length) ? 0 : turn+1;

      var dices = rollDice(),
          dice = dices[0]+dices[1],
          outputDices = String.fromCharCode(9855 + dices[0]),
          player = players[turn];

      // start this history turn
      history[plays] = {color: player.color, entries: []};

      // show the dices
      outputDices += String.fromCharCode(9855 + dices[1]);
      saveToHistory(strings.TURN, players[turn].name);
      saveToHistory(strings.DICE, outputDices);

      // move the player
      var property = Table.updatePosition(player, dice);
      saveToHistory(strings.LAND, property.name);

      // set this turn information for the controller
      var amount = Table.requiredPayment(property, player);
      turnInfo = {
        pay: amount,
        ready: amount === 0,
        player: player,
        property: property,
        dices: outputDices,
        canBuy: Table.canIBuy(property)
      };

      // if it's the AI, let him play
      if(player.isAI) {
        // let the AI play
        playAI(player, property);
      }

      return turnInfo;
    };

    /**
     * let the AI play
     * @param   {object}  player Playing player
     * @param   {object}  property property the player is in
     * @returns {boolean} return if player was able to play
     */
    var playAI = function (player, property) {

      // check if need to pay anything
      var amount = Table.requiredPayment(property, player);
      // if there's anything to pay
      if (amount) {
        var sellHouse = function(property) {
              if(property.buildings) {
                saveToHistory(strings.SOLD_HOUSE, property.name);
                Table.sell(property);
                return true;
              }
            },
            findCheapest = function(property) {
              if(cheapest.price > property.price) {
                cheapest = property;
              }
            };

        // get enough money
        while (player.account < amount) {
          // if no more properties, declare bankrupt
          if(!player.properties.length) {
            saveToHistory(strings.BROKE, player.name);
            return false;
          }

          // start selling the houses first
          if(player.properties.some(sellHouse)) {
            continue;
          }

          // no more houses, sell one property
          // already checked that 0 exists
          var cheapest = player.properties[0];
          player.properties.forEach(findCheapest);

          Table.sell(cheapest);
          saveToHistory(strings.SOLD_PROPERTY, cheapest.name);
        }

        // pay what's due
        pay(property, player);
      }

      // can i buy it?
      if(Table.canIBuy(property)) {
        // then buy it
        if(Table.buy(property, player)) {
          // enough monrey
          saveToHistory(strings.BOUGHT, property.name);
        } else {
          saveToHistory(strings.NOT_BOUGHT, property.name);
        }
      }

      // can i build anything?
      var properties = Table.whereCanIBuild(player);

      saveToHistory(strings.CAN_BUILD, properties.length);

      // let the AI buy only one property per turn
      if(properties.length) {
        if(Table.build(properties[0])) {
          saveToHistory(strings.BUILT, properties[0].name);
          saveToHistory(strings.PROPERTIES_HOUSE, properties[0].buildings);
        } else {
          saveToHistory(strings.NOT_BUILT, properties[0].name);
        }
      }

      return play();
    };

    /**
     * Pay what is due in that property
     * @param   {object} property Property the player is in
     * @param   {object} player Playing player
     * @returns {object} Turn information
     */
    var pay = function(property, player) {
      // get the value just for displaying purposes
      var amount = Table.requiredPayment(property, player);
      saveToHistory(strings.PAY, amount);

      var motive = Table.pay(property, player);
      saveToHistory(strings.PAY_BECAUSE, motive);
      turnInfo.ready = true;

      return turnInfo;
    };

    /**
     * Save to the history array
     * @param {string} string String to save
     * @param {string} str    String to replace on previous string (%s)
     */
    var saveToHistory = function(string, str) {
      history[plays].entries.push(string.replace('%s', str));
    };

    /**
     * Rolls the 2 dices
     * @returns {Array} the value os the 2 dices
     */
    var rollDice = function () {
      return [Math.floor((Math.random() * 6) + 1), Math.floor((Math.random() * 6) + 1)];
    };

    // define what is available
    this.init = init;
    this.play = play;
    this.buy = Table.buy;
    this.players = players;
    this.history = history;
    this.pay = pay;
  }]);
}());