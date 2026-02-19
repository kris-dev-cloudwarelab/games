

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;



function drawConsoles(){

    /// Central message
    central_message.classList = ship.console.classList
    central_message.innerHTML = `
        ${ship.console.display_message}
    `   

    /// DEV console
    const dev_console_class = presets.dev  ? "" : "hidden"
    dev_console.classList = `console ${dev_console_class}`

    /// UPGRADE console
    let upgrade_console_class = (ship.upgrades.menu_available && canAffordAnyUpgrades()) ? "" : "hidden"
    upgrade_console.classList = `console ${upgrade_console_class}`

    ship_speed_row.classList = ship.upgrades.speed.level ? "console_row" : "console_row hidden"
    ship_speed_display.innerHTML = `Speed: ${getUpgradeLevel("ship_speed")}`
    ship_speed_note.innerHTML = getUpgradeNote("ship_speed")

    ship_harvest_row.classList = ship.upgrades.harvest.level ? "console_row" : "console_row hidden"
    ship_harvest_display.innerHTML = `Harvest: ${getUpgradeLevel("ship_harvest")}`
    ship_harvest_note.innerHTML = getUpgradeNote("ship_harvest")

    ship_weapon_row.classList = ship.upgrades.weapon.level ? "console_row" : "console_row hidden"
    ship_weapon_display.innerHTML = `Weapon: ${getUpgradeLevel("ship_weapon")}`
    ship_weapon_note.innerHTML = getUpgradeNote("ship_weapon")

    /// CARGO console
    const cargo_console_class = ship.cargo.resources ? "" : "hidden"
    cargo_console.classList = `console ${cargo_console_class}`
    cargo_console_display.innerHTML = `
        <br/>Energy: ${ship.cargo.resources}
    `

    /// NAV console
    // let ship_space_coordinates = getShipsSpaceCoordinates();
    let ship_galaxy_coordinates = getUIFriendlyCoordinates(ship);
    nav_console_display.innerHTML = `
        <br/>Galaxy: X${space.galaxy.x}Y${space.galaxy.y}
        <br/>Coordinates: ${ship_galaxy_coordinates.x}, ${ship_galaxy_coordinates.y}
    `
}

function canAffordAnyUpgrades(){

    if(ship.upgrades.speed.level > 0 && getUpgradeLevel("ship_speed") < ship.upgrades.max_level && ship.cargo.resources > resToUpgrade("ship_speed")) return true
    if(ship.upgrades.harvest.level > 0 && getUpgradeLevel("ship_harvest") < ship.upgrades.max_level && ship.cargo.resources > resToUpgrade("ship_harvest")) return true
    if(ship.upgrades.weapon.level > 0 && getUpgradeLevel("ship_weapon") < ship.upgrades.max_level && ship.cargo.resources > resToUpgrade("ship_weapon")) return true
}

function getUpgradeNote(upgrade_type){
    if(getUpgradeLevel(upgrade_type) >= ship.upgrades.max_level){
        return `
            <span class="note">Maximum level reached</span>
        `
    }
    return `
        <span class="note">${resToUpgrade(upgrade_type)} energy required</span>
    `
}

function maxShipUpgrades(){

    ship.cargo.resources = 10*1000*1000
    while(getUpgradeLevel("ship_speed") < ship.upgrades.max_level && ship.cargo.resources > resToUpgrade("ship_speed")){
        upgrade("ship_speed")
    }
    while(getUpgradeLevel("ship_harvest") < ship.upgrades.max_level && ship.cargo.resources > resToUpgrade("ship_harvest")){
        upgrade("ship_harvest")
    }
    while(getUpgradeLevel("ship_weapon") < ship.upgrades.max_level && ship.cargo.resources > resToUpgrade("ship_weapon")){
        upgrade("ship_weapon")
    }
}
function upgrade(upgrade_type){

    console.log("Upgrading " + upgrade_type)

    if(getUpgradeLevel(upgrade_type) >= ship.upgrades.max_level){
        shipSpeak("Maximum damage reached", false)
        return
    }
    if(ship.cargo.resources < resToUpgrade(upgrade_type)){
        shipSpeak("not enough energy", false)
        return
    } 
    ship.cargo.resources -= resToUpgrade(upgrade_type)
    ship.upgraded = true
    playAudio("audio_ship_collect", true, "assets/beep.mp3")

    if(upgrade_type == "ship_speed"){
        ship.upgrades.speed.level++;
        const step_size2 = 1; 
        ship.v_max =  Math.round((ship.v_max+step_size2)*100)/100
    }else if(upgrade_type == "ship_harvest"){       
        ship.upgrades.harvest.level++;
    }else if(upgrade_type == "ship_weapon"){   
        ship.upgrades.weapon.level++;      
    }
    drawConsoles();/// update right away
}
function getUpgradeLevel(upgrade_type){
    let level = false;
    if(upgrade_type == "ship_speed"){
        return ship.upgrades.speed.level
    }
    if(upgrade_type == "ship_harvest"){
        return ship.upgrades.harvest.level
    }
    if(upgrade_type == "ship_weapon"){
        return ship.upgrades.weapon.level
    }
    return level;    
}
function resToUpgrade(upgrade_type){
    let level = getUpgradeLevel(upgrade_type);
    return 10*Math.pow(2, level-1); /// 10, 20, 40, 80, 160 etc.
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
            <br/>Results in ${Math.round((ship.console.ms_to_scan-delta)/1000)}s
        `;
    }else{
        ship.console.current_planet_scan_complete = true;
        
        const harvest_msg = ship.upgrades.harvest.level > 0 ? " (harvesting)" : "";
        scan_results.innerHTML = `
            <b>${planet.name}</b>
            <br/>Health: ${planet.health} /${planet.max_health}
            <br/>Energy: ${planet.resources} ${harvest_msg}
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
            if(ship.alive) return
            restartGame();
        }else{
            changeConsoleMessage(`Rebuilding ${ship.name} in ${countdown}`);
        }
    }, 1000);
}
function changeConsoleMessage(message, type){
    
    if(type === "danger"){
        ship.console.display_message = message
        ship.console.classList = "console danger_message";
    }else{  
        ship.console.display_message = message
        ship.console.classList = "console"
        ship.console.last_message = message     
    }
}
function revertToLastMessage(){
    changeConsoleMessage(ship.console.last_message);
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

function drawMothershipPointer(){
    if(space.bodies.find(b => b.type === "mothership")){
        drawHomePointer(mothership.x, mothership.y);
    }else{
        /// Point to the center of galaxy 0,0
        let {x, y} = space.galaxy;
        /// Delta x and y to go from this galaxy to galaxy 0,0
        let dx = space.x/2 - x*space.x; /// The more to the right, the more negative
        let dy = space.y/2 - y*space.y; /// The more up, the more negative
        // let x0 = ship.x + dx;
        // let y0 = ship.y + dy;
        drawHomePointer(dx, dy);
    }
}

function drawHomePointer(homeX, homeY) {
    const ship_x = ship.x;
    const ship_y = ship.y;

    // Direction from ship (center) to home
    const dx = homeX - ship_x;
    const dy = homeY - ship_y;

    // If home is visible, don't draw pointer
    if (isVisibleForPlayer(mothership)) return;
    // console.log(`drawHomePointer() visible: ${isVisibleForPlayer(mothership)}`);

    const angle = Math.atan2(dy, dx);

    // Distance to canvas edge
    const margin = 40;
    const halfW = canvas.width / 2 - margin;
    const halfH = canvas.height / 2 - margin;

    const scaleX = dx !== 0 ? halfW / Math.abs(dx) : Infinity;
    const scaleY = dy !== 0 ? halfH / Math.abs(dy) : Infinity;
    const scale = Math.min(scaleX, scaleY);

    const edgeX = ship_x + dx * scale;
    const edgeY = ship_y + dy * scale;
    // console.log(`drawHomePointer()`, {ship_x, ship_y, dx, dy, angle, edgeX, edgeY});

    drawArrow(edgeX, edgeY, angle);
}

function drawArrow(x, y, angle) {

    const size = 25;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(size, 0);
    ctx.lineTo(-size * 0.6, size * 0.5);
    ctx.lineTo(-size * 0.6, -size * 0.5);
    ctx.closePath();

    ctx.fillStyle = getCSSVariable("--main-accent");
    ctx.fill();

    // Draw "M" for Home marker
    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if(x<space.x/2){
        /// Draw upside down M when on the left
        ctx.fillText("M", -size * 0.15, 0);
    }else{
        ctx.fillText("W", -size * 0.15, 0);        
    }

    ctx.restore();
}