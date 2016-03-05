(function () {
  'use strict';

  /**
   * Service with monopoly table actions and tests
   */
  angular.module('monopoly').service('Table', ['initialAmount', function(initialAmount) {

    // type of properties
    var types = 
        {
          GO: 'go',
          NORMAL: 'normal',
          TAX: 'tax',
          UTILITIES: 'utilities',
          RAILROAD: 'railroad',
          JAIL: 'jail',
          PARK: 'park',
          GO_JAIL: 'go-jail',
        },
        // which of the above can be bought
        buyable = [
          types.NORMAL,
          types.UTILITIES,
          types.RAILROAD
        ],
        // all the properties on the table
        properties = [
          { type: types.GO, name: 'GO!' },
          { type: types.NORMAL, name: 'Mediterranean Ave.', price: 60, rent: 2, group: 'Brown', buildings: 0 },
          { type: types.PARK, name: 'Not coded' },
          { type: types.NORMAL, name: 'Baltic Ave.', price: 60, rent: 4, group: 'Brown', buildings: 0 },
          { type: types.TAX, name: 'Income Tax', price: 200 },
          { type: types.RAILROAD, name: 'Reading Railroad', price: 200, rent: 100, group: 'Railroad', buildings: 0 },
          { type: types.NORMAL, name: 'Oriental Ave.', price: 100, rent: 6, group: 'Light-Green', buildings: 0 },
          { type: types.PARK, name: 'Not coded' },
          { type: types.NORMAL, name: 'Vermont Ave.', price: 100, rent: 6, group: 'Light-Green', buildings: 0 },
          { type: types.NORMAL, name: 'Connecticut Ave.', price: 120, rent: 8, group: 'Light-Green', buildings: 0 },
          { type: types.JAIL, name: 'Jail' },
          { type: types.NORMAL, name: 'St. Charles Place', price: 140, rent: 10, group: 'Violet', buildings: 0 },
          { type: types.UTILITIES, name: 'Electric Company', price: 150, rent: 100, group: 'Utilities', buildings: 0},
          { type: types.NORMAL, name: 'States Ave.', price: 140, rent: 10, group: 'Violet', buildings: 0 },
          { type: types.NORMAL, name: 'Virginia Ave.', price: 160, rent: 12, group: 'Violet', buildings: 0 },
          { type: types.RAILROAD, name: 'Pennsylvania Railroad', price: 200, rent: 100, group: 'Railroad', buildings: 0 },
          { type: types.NORMAL, name: 'St. James Place', price: 180, rent: 14, group: 'Orange', buildings: 0 },
          { type: types.PARK, name: 'Not coded' },
          { type: types.NORMAL, name: 'Tennessee Ave.', price: 180, rent: 14, group: 'Orange', buildings: 0 },
          { type: types.NORMAL, name: 'New York Ave.', price: 200, rent: 16, group: 'Orange', buildings: 0 },
          { type: types.PARK, name: 'Free Parking' },
          { type: types.NORMAL, name: 'Kentucky Ave.', price: 220, rent: 18, group: 'Red', buildings: 0 },
          { type: types.PARK, name: 'Not coded' },
          { type: types.NORMAL, name: 'Indiana Ave.', price: 220, rent: 18, group: 'Red', buildings: 0 },
          { type: types.NORMAL, name: 'Illinois Ave.', price: 240, rent: 20, group: 'Red', buildings: 0 },
          { type: types.RAILROAD, name: 'B. & O. Railroad', price: 200, rent: 100, group: 'Railroad', buildings: 0 },
          { type: types.NORMAL, name: 'Atlantic Ave.', price: 260, rent: 22, group: 'Yellow', buildings: 0 },
          { type: types.NORMAL, name: 'Ventnor Ave.', price: 260, rent: 22, group: 'Yellow', buildings: 0 },
          { type: types.UTILITIES, name: 'Water Works', price: 150, rent: 100, group: 'Utilities' , buildings: 0},
          { type: types.NORMAL, name: 'Marvin Gardens', price: 280, rent: 22, group: 'Yellow', buildings: 0 },
          { type: types.GO_JAIL, name: 'Go to Jail' },
          { type: types.NORMAL, name: 'Pacific Ave.', price: 300, rent: 26, group: 'Dark-Green', buildings: 0 },
          { type: types.NORMAL, name: 'North Carolina Ave.', price: 300, rent: 26, group: 'Dark-Green', buildings: 0 },
          { type: types.PARK, name: 'Not coded' },
          { type: types.NORMAL, name: 'Pennsylvania Ave.', price: 320, rent: 28, group: 'Dark-Green', buildings: 0 },
          { type: types.RAILROAD, name: 'Short Line Railroad', price: 200, rent: 100, group: 'Railroad', buildings: 0 },
          { type: types.PARK, name: 'Not coded' },
          { type: types.NORMAL, name: 'Park Place', price: 350, rent: 35, group: 'Dark-Blue', buildings: 0 },
          { type: types.TAX, name: 'Luxuary Tax', price: 100 },
          { type: types.NORMAL, name: 'Boardwalk', price: 400, rent: 50, group: 'Dark-Blue', buildings: 0 },
        ],

        strings = {
          TAX: 'Paying tax',
          OTHER: 'Paying rent'
        }
    ;

    /**
     * Starts the table
     */
    var init = function() {
      // resets the properties information
      properties.forEach(function(property) {
        property.owner = undefined;
        property.buildings = 0;
      });
    };

    /**
     * Updates the player position and pays salary
     * @return {object} the current property
     */
    var updatePosition = function(player, dice) {

      var position = (player.position + dice) % properties.length;

      // go to jail
      if(position === 30) {
        position = 10;
      } 
      else if(position < player.position) {
        // pay the salary
        player.account += initialAmount;
      }

      player.position = position;

      return properties[position];
    };

    /**
     * Gets the amount that needs to be paid
     * @param   {object} property Square the player is in
     * @param   {object} player Playing player
     * @returns {number} the amount
     */
    var requiredPayment = function(property, player) {

      // always pay taxes
      if(property.type === types.TAX) {
        return property.price;
      }

      // pay the rent, very simplified version
      if(typeof property.owner !== 'undefined' && property.owner.name !== player.name) {
        return property.rent*(property.buildings*5+1);
      }

      return 0;
    };

    /**
     * Pay the amount for the given property
     * @param   {object} property Square the player is in
     * @param   {object} player Playing player
     * @returns {string} The reason for paying
     */
    var pay = function(property, player) {

      var value = requiredPayment(property, player);
      player.account -= value;

      // just a tax
      if(property.type === types.TAX) {
        return strings.TAX;
      }

      // pay to the owner
      if(typeof property.owner !== 'undefined' && property.owner.name !== player.name) {
        property.owner.account += value;

        return strings.OTHER;
      }
    };

    /**
     * Check if property can be bought
     * @param   {object}  property Square to test
     * @returns {boolean} returns if property can be bought
     */
    var canIBuy = function(property) {

      // sellable && !owned
      return buyable.indexOf(property.type) !== -1 &&
        typeof property.owner === 'undefined'
      ;
    };

    /**
     * Buy a property
     * @param   {object} property Square the player is in
     * @param   {object} player Playing player
     * @returns {boolean} returns if the player could buy the property
     */
    var buy = function(property, player) {

      // make sure seller has the money
      if(player.account < property.price) {
        return false;
      }

      player.account -= property.price;
      
      // define the pointers
      property.owner = player;
      player.properties.push(property);

      return true;
    };

    /**
     * Gets the list of properties where a player can build
     * @param   {object} player Playing player
     * @returns {Array} the properties that can be built
     */
    var whereCanIBuild = function(player) {

      var buildSquare = [];
      // stores the groups that were already checked
      var groups = [];
      
      player.properties.forEach(function(property) {

        // dont check a group twice
        if(groups.indexOf(property.group) !== -1) {
          return;
        }

        // you cant build if you bought something that is not a normal property
        if(property.type !== types.NORMAL) {
          return;
        }

        groups.push(property.group);
        
        // get same group properties
        var group = getGroupFromProperties(property.group);

        // do i own all the properties in the group
        var own = 0;
        group.forEach(function(property) {
          if(property.owner === player) {
            own++;
          }
        });

        if(own !== group.length) {
          return;
        }

        // check on which properties the player can build
        // gets the lowest properties on the group with the same amount of buildings
        var build = [];
        var smallest = 3;
        group.forEach(function(property) {
          if(smallest > property.buildings) {
            build = [property];
            smallest = property.buildings;
          } else if(smallest === property.buildings) {
            build.push(property);
          }
        });

        // add the properties to the  build list
        Array.prototype.push.apply(buildSquare, build);
      });

      return buildSquare;
    };

    /**
     * Build on the given property
     * @param   {object}  property Given property
     * @returns {boolean} returns if could build on the given property
     */
    var build = function(property) {

      // make sure seller has the money
      if(property.owner.account < property.price) {
        return false;
      }

      // i'll asume the house costs the same as the property
      property.owner.account -= property.price;
      property.buildings++;

      return true;
    };

    /**
     * get the properties with same group (color)
     * @param   {string} name the group name
     * @returns {Array} the list of similar properties
     */
    var getGroupFromProperties = function(name) {
      var group = [];
      properties.forEach(function(property) {
        if(property.group === name) {
          group.push(property);
        }
      });

      return group;
    };

    /**
     * Sell a property or building
     * @param {object} property property being sold or demolished
     */
    var sell = function(property) {
      if(property.buildings > 0) {
        sellBuilding(property);
      } else {
        sellProperty(property);
      }
    };

    /**
     * Sell a building
     * @param {object} property property being demolished
     */
    var sellBuilding = function(property) {
      property.buildings--;
      property.owner.account += property.price/2;
    };

    /**
     * Sell a property
     * @param {object} property property being sold
     */
    var sellProperty = function(property) {
      var player = property.owner;
      player.account += property.price/2;

      // find the property
      var index = -1;
      player.properties.some(function(p, i) {
        if(p === property) {
          index = i;
          return true;
        }
      });

      // remove the property and unset the owner
      player.properties.splice(index, 1);
      property.owner = undefined;
    };

    // define what is available
    this.init = init;
    this.updatePosition = updatePosition;
    this.requiredPayment = requiredPayment;
    this.pay = pay;
    this.canIBuy = canIBuy;
    this.buy = buy;
    this.whereCanIBuild = whereCanIBuild;
    this.build = build;
    this.getGroupFromProperties = getGroupFromProperties;
    this.sell = sell;
    this.properties = properties;
  }]);
}());