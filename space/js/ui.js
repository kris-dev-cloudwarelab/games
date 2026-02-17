

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;



function drawConsoles(){

    mothership_console.innerHTML = `
        ${ship.console.last_message}
    `
    

    // let ship_space_coordinates = getShipsSpaceCoordinates();
    let ship_galaxy_coordinates = getUIFriendlyCoordinates(ship);
    let upgrade_menu = `

        <b>UPGRADES</b>

        <div class="console_row">
            <div class="small_button" onclick="upgrade('ship_speed')">✚</div>
            Ship speed: ${Math.round(ship.thrust*100)} 
        </div>
        <span class="note">${resToUpgrade("ship_speed")} energy required</span>

        <div class="console_row">
            <div class="small_button" onclick="upgrade('projectile_damage')">✚</div>
            Laser damage: ${Math.round(ship.weapon.projectile_damage)} 
        </div> 
        <span class="note">${resToUpgrade("projectile_damage")} energy required</span>

        <br/>  
        <br/>  
    `
    if(!ship.console.upgrade_menu_available) upgrade_menu = "";
    ship_console.innerHTML = `
        
        ${upgrade_menu}

        <b>CARGO</b>
        <br/>Energy: ${ship.cargo.resources}             
        <br/>

        <br/><b>NAVIGATION</b>   
        <br/>Galaxy: X${space.galaxy.x}Y${space.galaxy.y}
        <br/>Coordinates: ${ship_galaxy_coordinates.x}, ${ship_galaxy_coordinates.y}
    `


}

function upgrade(upgrade_type){

    console.log("Upgrading " + upgrade_type)

    if(upgrade_type == "ship_speed"){

        if(getUpgradeLevel(upgrade_type) >= 10){
            shipSpeak("Maximum speed reached", false)
            return
        }
        if(ship.cargo.resources < resToUpgrade(upgrade_type)){
            shipSpeak("not enough energy", false)
            return
        } 

        ship.cargo.resources -= resToUpgrade("ship_speed")
        ship.upgraded = true
        playAudio("audio_ship_collect", true, "assets/beep.mp3")
        const step_size = ship.thrust_upgrade_step_size;
        ship.thrust =  Math.round((ship.thrust+step_size)*100)/100
        ship.v_max =  Math.round((ship.v_max+1)*100)/100
    }
    if(upgrade_type == "projectile_damage"){       

        if(getUpgradeLevel(upgrade_type) >= 10){
            shipSpeak("Maximum damage reached", false)
            return
        }
        if(ship.cargo.resources < resToUpgrade(upgrade_type)){
            shipSpeak("not enough energy", false)
            return
        } 

        ship.cargo.resources -= resToUpgrade("projectile_damage")
        ship.upgraded = true
        playAudio("audio_ship_collect", true, "assets/beep.mp3")
        const step_size = ship.weapon.projectile_damage_upgrade_step_size; 
        ship.weapon.projectile_damage = Math.round((ship.weapon.projectile_damage+step_size)*100)/100
        ship.weapon.projectile_thrust = Math.round((ship.weapon.projectile_thrust+2)*100)/100
    }
    drawConsoles();/// update right away
}
function getUpgradeLevel(upgrade_type){
    let level = false;
    if(upgrade_type == "ship_speed"){
        level = Math.floor(ship.thrust/ship.thrust_upgrade_step_size);
    }
    if(upgrade_type == "projectile_damage"){
        level = Math.floor(ship.weapon.projectile_damage/ship.weapon.projectile_damage_upgrade_step_size);
    }
    return level;    
}
function resToUpgrade(upgrade_type, level){
    level = level || getUpgradeLevel(upgrade_type);
    if(level === 1) return 10
    else return resToUpgrade(upgrade_type, level-1)*2;
}
function screenToWorld(x, y) {
  return {
    x: x + space.camera.x,
    y: y + space.camera.y
  };
}
function worldToScreen(x, y) {
  return {
    x: x - space.camera.x,
    y: y - space.camera.y
  };
}

function getUIFriendlyCoordinates({x, y}){
    /// Move 0, 0 to mothership
    x -= mothership.x;
    y -= mothership.y;
    let reduction_factor = 100;
    return {
        x: Math.round(x/reduction_factor),        
        y: Math.round(y/reduction_factor)
    }
}
function drawPlanetScanResults(){
    let planet = ship.console.current_planet;
    if(!planet) ship.console.current_planet_scan_complete = false;

    let date_now = Date.now();
    let delta = date_now - ship.console.current_planet_scan_started_at;

    if(delta <= ship.console.ms_to_scan){ /// 5 seconds
        scan_results.innerHTML = `
            <b>Scanning...</b>
            <br/>ETA: ${Math.round((ship.console.ms_to_scan-delta)/1000)} seconds
        `;
    }else{
        ship.console.current_planet_scan_complete = true;
        scan_results.innerHTML = `
            <b>${planet.name}</b>
            <br/>Health: ${planet.health} /${planet.max_health}
            <br/>Energy: ${planet.resources}
        `;
    }

    let {x, y} = worldToScreen(planet.x, planet.y);
    scan_results.style.left = `${x+planet.radius}px`;
    scan_results.style.top = `${y}px`;
    document.querySelector("body").appendChild(scan_results);
}

function startRespawnCountdown(){
    let countdown = 5;
    mothershipSpeak(`Rebuilding ${ship.name} in 5, 4, 3, 2, 1`, true);
    let interval = setInterval(() => {
        countdown--;
        if(countdown < 0){
            clearInterval(interval);
            restartGame();
        }else{
            ship.console.last_message = `
                Respawn in ${countdown}
            `
        }
    }, 1000);
}
function getCSSVariable(variable_name){
    return window.getComputedStyle(document.documentElement).getPropertyValue(variable_name);
}

function drawHealthBar(body){

    /// Health bar
    if(body.health < body.max_health){
      const healthRatio = Math.max(0, Math.min(1, body.health / body.max_health));
      const width = body.radius;
      const height = 7;
      const filledWidth = width * healthRatio;

      const x = body.x - body.radius/2;
      const y = body.y - body.radius - 10;
      // Background (empty health)
      ctx.fillStyle = "#444";
      ctx.fillRect(x, y, width, height);

      // Health (filled portion)
      if(body.health > 0){
        ctx.fillStyle = getCSSVariable("--accent-green");
        ctx.fillRect(x, y, filledWidth, height);
      }else{
        ctx.fillStyle = getCSSVariable("--accent-red");
        ctx.fillRect(x, y, width, height);
      }

      // Optional border
      ctx.strokeStyle = "#000";
      ctx.strokeRect(x, y, width, height);
    }
}