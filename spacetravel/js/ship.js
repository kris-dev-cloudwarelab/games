


    
const ship = {
  type: "ship",
  name: "Android",
  name_number: 6941,
  cargo: {
    resources: presets.starting_resources
  },
  audio_active: false,
  zIndex: 100,
  x: presets.ship.x,
  y: presets.ship.y,
  vx: 0,
  vy: 0,
  angle: -1.6, /// Looking up
  thrust: 0.01,
  thrust_upgrade_step_size: 0.01,
  v_max: 5,
  weapon: {
    projectile_damage: 1,
    projectile_damage_upgrade_step_size: 1,
    projectile_thrust: 3,
  },
  radius: 6,
  draw_size: 30,
  engine_on: false,
  collides: true,
  gravity_applies: true,
  alive: true,
  console: {
    last_message: "Click to start",
    upgrade_menu_available: presets.upgrade_menu_available,
    scan_radius: 500,
    suction_radius: 200,
    suction_speed: 6,
    current_planet: null,
    ms_to_scan: 5000
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
    if(other_body.type == "star"){
        ship.destroy();
    }
    
    if(other_body.type === "asteroid"){
      /// Collect asteroid
      ship.cargo.resources += other_body.resources || 0;
      playAudio("audio_ship_collect", true, "assets/beep.mp3")
      other_body.destroy();
    }
    
    if(other_body.danger_to_ship && !space.game_over){
      /// Ship hit
      ship.destroy();
    }
  },
  destroy: function(){
        if(!ship.alive) return
        ship.alive = false;   
        ship.collides = false;
        ship.engine_on = true; /// For dust   
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
            spawnDust(ship, fps_check=false)
        }

        ship.x += ship.vx;
        ship.y += ship.vy;
        wrapBody(ship)

        /// Check for close asteroids
        const nearest_asteroid = findNearestBody("asteroid");
        if(checkIfBodyIsWithinDistanceToShip(nearest_asteroid, ship.console.suction_radius)){
            /// Suck asteroid towards ship
            nearest_asteroid.vx = Math.cos(Math.atan2(ship.y - nearest_asteroid.y, ship.x - nearest_asteroid.x)) * ship.console.suction_speed;
            nearest_asteroid.vy = Math.sin(Math.atan2(ship.y - nearest_asteroid.y, ship.x - nearest_asteroid.x)) * ship.console.suction_speed;
        }   

  }
};
function planetScanner(){
    let planet = getPlanetInScanArea();
    if(planet && planet !== ship.console.current_planet){
        scan_results.style.display = "block";
        ship.console.current_planet = planet
        ship.console.current_planet_scan_started_at = Date.now()
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
    }else if(!planet){
        scan_results.style.display = "none";
        ship.console.current_planet = null
        ship.console.current_planet_scan_started_at = null
    }
}

function getShipImage(){
    if(!ship.alive) return shipExplodeImage;
    if(ship.engine_on) return shipImageEngineOn;
    else return shipIdleImage
}