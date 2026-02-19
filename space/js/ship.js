


    
const ship = {
  type: "ship",
  zIndex: 10,
  x: presets.ship.x,
  y: presets.ship.y,
  name: "Android",
  name_number: 6941,
  audio_active: false,
  angle: -1.6, /// Looking up
  vx: 0,
  vy: 0,
  v_max: 4,
  radius: 10,
  draw_size: 30,

  upgrades: {
    max_level: 12,
    menu_available: false,
    speed: {
        level: 1,
        initial: 0.02,
        step_size: 0.01
    },
    harvest: {
        level: 0,
        getScanRadius: () => {
            let scan_radius = 300 + getUpgradeLevel("ship_harvest")*50
            return scan_radius
        },
        getSuctionRadius: () => {
            let suction_radius = 100 + 50 * getUpgradeLevel("ship_harvest"); /// Start with 100 to make it easy
            return suction_radius;
        },
        getSuctionSpeed: () => {
            let suction_speed = 5 + 0.5 * getUpgradeLevel("ship_harvest"); /// Start with 6 to make it easy
            /// Should not exceed ship width, otherwise it will jump over the ship and be crap
            suction_speed = suction_speed > ship.radius ? ship.radius : suction_speed
            return suction_speed;
        },
        getEnergyDrainPerSecond: () => {
            let energy_drain_per_second = 5 * getUpgradeLevel("ship_harvest")
            return energy_drain_per_second
        },
        msBetweenOrbs: () => {
            let energy_drain_per_second = ship.upgrades.harvest.getEnergyDrainPerSecond();
            let orbs_per_second = energy_drain_per_second/presets.energy_per_orb;
            let ms_between_orbs = 1000/orbs_per_second;
            return ms_between_orbs
        }
    },
    weapon: {
        level: 0,
        getProjectileDamage: () => {
            let projectile_damage = 1 * getUpgradeLevel("ship_weapon");
            return projectile_damage;
        },
        getProjectileThrust: () => {
            let projectile_thrust = 4 + 2 * getUpgradeLevel("ship_weapon");
            return projectile_thrust;
        }
    }
  },

  engine_on: false,
  collides: true,
  gravity_applies: true,
  alive: true,
  destruction_countdown: null,
  cargo: {
    resources: presets.starting_resources
  },
  console: {
    display_message: "Click to start",
    classList: "console",
    current_planet: null,
    ms_to_scan: 5000
  },
  get thrust(){
    return this.upgrades.speed.initial + this.upgrades.speed.step_size * (this.upgrades.speed.level - 1);
  },

  turnToCurrentMovement: function(){
      ship.angle = Math.atan2(ship.vy, ship.vx);
  },
  turnToCoordinates: function(x, y){
      ship.angle = Math.atan2(y - ship.y, x - ship.x);
  },
  turnAwayFromCoordinates: function(x, y){
      ship.angle = Math.atan2(y - ship.y, x - ship.x) + Math.PI;
  },
  collisionDetected: function(other_body){
    // console.log("Ship.collisionDetected() other_body.type", other_body.type);
    if(other_body.type == "star" && !this.destruction_countdown){
        let overheat_counter = 7000;
        let recheck_ms = 200;
        this.destruction_countdown = setInterval(() => {
            /// Check if ship is still overheating
            if(overheat_counter <= 0 && this.alive){
                this.destroy();                
            }else if(checkCollisionsForBodies(this, other_body)){
                overheat_counter -= recheck_ms;
                changeConsoleMessage(`⚠️ Your ship will overheat in ${Math.round(overheat_counter/1000)}s ⚠️`, "danger");
            }else{
                /// Stop
                revertToLastMessage();
                clearTimeout(this.destruction_countdown);
                this.destruction_countdown = null;
            }
        }, recheck_ms)
    }else if(other_body.type === "asteroid"){
      /// Collect asteroid
      this.addResources(other_body.resources)
      playAudio("audio_ship_collect", true, "assets/beep.mp3")
      other_body.destroy();
    }else if(other_body.danger_to_ship && !space.game_over){
      /// Ship hit
      this.destroy();
    }
  },
  addResources(resources = 0){
    this.cargo.resources += resources;
    this.cargo.resources_collected_all_time += resources;
  },
  destroy: function(){
        if(!ship.alive) return
        this.alive = false;   
        this.collides = false;
        this.engine_on = true; /// For dust   
        playAudio("audio_ship_explosion", true, "assets/ship_explosion.mp3");   
        playAudio("audio_ship", false);
        startRespawnCountdown();   
  },
  draw: function() {
        if (!shipIdleImage.complete) return; // avoid drawing before load
        if (!shipImageEngineOn.complete) return; // avoid drawing before load

        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(ship.angle+1.6);
        // Draw image centered on ship position
        const width = ship.draw_size;   // desired draw size
        const height = ship.draw_size;    
        ctx.drawImage(
            getShipImage(),
            -width / 2,
            -height / 2,
            width,
            height
        );
        ctx.restore();
  },
  update: function() {

        if (!ship.alive){
            /// Rotate uncontrollably
            ship.angle += Math.PI/20;
        }else{
            /// Check speed limit
            ship.vx = ship.vx > ship.v_max ? ship.v_max : ship.vx;
            ship.vx = ship.vx < -ship.v_max ? -ship.v_max : ship.vx;
            ship.vy = ship.vy > ship.v_max ? ship.v_max : ship.vy;
            ship.vy = ship.vy < -ship.v_max ? -ship.v_max : ship.vy;
        }

        if (ship.engine_on) {
            ship.vx += Math.cos(ship.angle) * ship.thrust * fpsFactor();
            ship.vy += Math.sin(ship.angle) * ship.thrust * fpsFactor();
            spawnDust(ship, false)
        }

        ship.x += ship.vx;
        ship.y += ship.vy;
        wrapBody(ship)

        /// Check for close asteroids
        const nearest_asteroid = findNearestBody("asteroid");
        if(checkIfBodyIsWithinDistanceToShip(nearest_asteroid, ship.upgrades.harvest.getSuctionRadius())){
            /// Suck asteroid towards ship
            const dx = Math.cos(Math.atan2(ship.y - nearest_asteroid.y, ship.x - nearest_asteroid.x)) 
            nearest_asteroid.vx = dx * ship.upgrades.harvest.getSuctionSpeed() /// * fpsFactor();
            const dy = Math.sin(Math.atan2(ship.y - nearest_asteroid.y, ship.x - nearest_asteroid.x))
            nearest_asteroid.vy = dy * ship.upgrades.harvest.getSuctionSpeed() /// * fpsFactor();
        }   

  }
};
function planetScanner(){

    let planet = getPlanetInScanArea();
    if(planet && planet !== ship.console.current_planet){
        scan_results.style.display = "block";
        ship.console.current_planet = planet
        ship.console.current_planet_scan_started_at = Date.now()
        checkForEarthBroadcast(planet)

        if(ship.upgrades.harvest.level === 0) return
        
        clearTimeout(ship.cargo.energy_drain_timeout)
        clearInterval(ship.cargo.energy_drain_interval)
        ship.cargo.energy_drain_timeout = setTimeout(() => {
            ship.cargo.energy_drain_interval = setInterval(() => {
                planet.reactToDrain(presets.energy_per_orb)    
            },  ship.upgrades.harvest.msBetweenOrbs());            
        }, ship.console.ms_to_scan);

    }else if(!planet){
        scan_results.style.display = "none";
        ship.console.current_planet = null
        ship.console.current_planet_scan_started_at = null
        clearTimeout(ship.cargo.energy_drain_timeout)
        clearInterval(ship.cargo.energy_drain_interval)
    }
}

function checkForEarthBroadcast(planet){
    if(planet.name === "Earth" && !ship.earth_broadcast_received){
        ship.earth_broadcast_received = true
        earthSpeak(`          
            Hello? ...      
            Hello unidentified spacecraft
            We are the last survivors of planet Earth
            Our ships have been destroyed by a rogue AI, that calls itself the mothership

            Wait.
            Were you sent by the mothership?
            We need your help
            You must destroy the mothership
            Please save us!
            Destroy the mothership!
        `)
    }
}

function getShipImage(){
    if(!ship.alive) return shipExplodeImage;
    if(ship.engine_on) return shipImageEngineOn;
    else return shipIdleImage
}