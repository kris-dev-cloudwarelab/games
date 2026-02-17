

let mothership;
startGame();
function startGame(){


    ship.current_order = getOrderIndexByTag(presets.first_order_tag);
    
    generateGalaxy({announcement: false});
    loop(performance.now());
    setInterval(slowLoop, 500);
}
function restartGame(){

    if(ship.alive) return

    ship.alive = true;
    ship.collides = true;
    ship.engine_on = false;  
    ship.x = presets.ship.x;
    ship.y = presets.ship.y;
    ship.vx = 0;
    ship.vy = 0;

    ship.name_number++;
    
    space.galaxy.x = 0;
    space.galaxy.y = 0;
    generateGalaxy({announcement: false});
    welcomeMessage();

    setTimeout(() => {
        startOrder(ship.current_order);        
    }, presets.welcome_message_time_ms);

}

function gameOver(){

    if(space.game_over) return

    space.game_over = true;

    /// Stop ship        
    ship.inputs_disabled = true;
    ship.collides = false;
    /// Move ship slowly to mothership
    setInterval(autoShipMovement, 50);

    mothershipSpeak(`
        Game over. 
        C'est la vie! 
        I will self destruct in 
        Three...
        Two...
        One...`)
    ship.console.last_message = "You won!";

    /// Destroy all mothership projectiles
    // space.bodies = space.bodies.filter(b => b.type !== "mothership_projectile");
            

    setTimeout(() => {

        mothership_explosion_gif.style.display = "block";
        ship_console.style.display = "none";
        setInterval(drawMotherShipExplosion, 50);
        setTimeout(() => {
            playAudio("audio_explosion", true, "assets/mothership_explosion.mp3");
            ship.turnAwayFromCoordinates(mothership.x, mothership.y);
            mothership.exploded = true;
            mothership.exploded_at = Date.now();
            mothership_explosion_gif.style.width = "500vw";
            mothership_explosion_gif.style.filter = 'blur(10px)';
            // space.bodies.splice(space.bodies.indexOf(mothership), 1);
        }, 6000)
    }, 3000)    
}

function autoShipMovement(){

    if(!space.game_over) return

    if(mothership.exploded){

        /// Run away
        const ms_passed = Date.now() - mothership.exploded_at;
        if(ms_passed < 2000)ship.turnAwayFromCoordinates(mothership.x, mothership.y); 
        else ship.turnToCurrentMovement();        
        ship.v_max = 10;
        toggleShipEngines(true);
    }else{
        if(getDistanceToShip(mothership) >= mothership.radius + 66){
            /// Go towards mothership before it explodes
            ship.turnToCoordinates(mothership.x, mothership.y);
            ship.v_max = 2;
            toggleShipEngines(true);
        }else{
            /// Stop
            ship.turnToCoordinates(mothership.x, mothership.y);
            toggleShipEngines(false);
            ship.vx = 0;
            ship.vy = 0;
        }
    }

}
function drawMotherShipExplosion(){
    // ship.turnAwayFromCoordinates(mothership.x, mothership.y);
    if(space.galaxy.x !== 0 || space.galaxy.y !== 0){
        mothership_explosion_gif.style.display = "none";
        return;
    }
    let {x, y} = worldToScreen(mothership.x, mothership.y);
    mothership_explosion_gif.style.left = `${x}px`;
    mothership_explosion_gif.style.top = `${y}px`;  
}

function getPlanetInScanArea(){
    let nearest_planet = findNearestBody("planet")
    return checkIfBodyIsWithinDistanceToShip(nearest_planet, ship.console.scan_radius)
}
function checkIfBodyIsWithinDistanceToShip(body, critical_distance){
    let distance = getDistanceToShip(body);
    if(distance <= critical_distance){
        return body
    }
    return false
}

function getDistanceToShip(body){
    return Math.sqrt(Math.pow(body.x - ship.x, 2) + Math.pow(body.y - ship.y, 2));
}


// ---------- GAME LOOP ----------
function slowLoop(){
    checkOrderStatus();    
    planetScanner();
    drawConsoles();
    const number_of_asteroids = 3 + Math.floor(Math.random() * 2);
    // addAsteroids(1);
}

function fpsFactor(){
    const intended_fps = 144;
    let current_fps = space.camera.smoothedFps || 60;
    if(current_fps > 144){
        current_fps = 144
    }

    space.camera.fps_factor = intended_fps / current_fps;
    return space.camera.fps_factor
}
function loop(now) {



    /// Adjust camera
    space.camera.x = ship.x - canvas.width / 2;
    space.camera.y = ship.y - canvas.height / 2;
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(-space.camera.x, -space.camera.y);
    
    /// Physics linked to FPS (adjusted via fpsFactor)
    updatePhysics();

    /// Rendering
    space.bodies.forEach(p => p.draw());
    space.bodies_noninteractive.forEach(p => p.draw());
    ship.draw();
    if(ship.console.current_planet){
        drawPlanetScanResults()
    }

    
    /// FPS logic
    let delta = (now - space.camera.lastRefreshAt);   // ms since last frame
    if (delta > 100) delta = 100; // Prevent spiral of death (tab switch, lag spike)
    if (delta === 0) delta = 7; /// Uncommon, but can happen
    space.camera.lastRefreshAt = now;
    const fps = 1000 / delta;
    space.camera.smoothedFps = space.camera.smoothedFps * 0.9 + fps * 0.1; // exponential moving average

    // Draw FPS overlay (reset transform first)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "white";
    ctx.font = "14px monospace";
    ctx.fillText("FPS: " + space.camera.smoothedFps.toFixed(0), 10, 20);
    ctx.fillText("iBodies: " + space.bodies.length, 10, 40);
    ctx.fillText("nBodies: " + space.bodies_noninteractive.length, 10, 60);

    requestAnimationFrame(loop);
}