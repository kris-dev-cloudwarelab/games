
// ---------- INPUT ----------

canvas.addEventListener("mousedown", () => {

    // console.log("mousedown event", event.button)
    event.preventDefault()
    if(!ship.alive || ship.inputs_disabled) return
    /// LMB for engines
    if(event.button == 0) toggleShipEngines(true)
});
addEventListener("wheel", (event) => { 
    if(!ship.alive || ship.inputs_disabled) return
    shootProjectile()
})
canvas.addEventListener("mouseup", () => {
    if(!ship.alive || ship.inputs_disabled) return
    toggleShipEngines(false)
});
// Optional: stop thrust if mouse leaves window
canvas.addEventListener("mouseleave", () => {
    if(!ship.alive || ship.inputs_disabled) return
    toggleShipEngines(false)
});

canvas.addEventListener("mousemove", (e) => {

    if(!ship.alive || ship.inputs_disabled) return
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const { x, y } = screenToWorld(screenX, screenY);

    ship.turnToCoordinates(x, y);
});

// ---------- RESET ----------
window.addEventListener("keydown", e => {
  if (e.key === "r" || e.key === "R") {
    restartGame();
  }
});

function toggleShipEngines(active){
    if(active && !ship.engine_on){
        ship.engine_on = true
        activateAudio()
        playShipAudio("assets/ship_engine_on.mp3")
    }else if(!active && ship.engine_on){
        ship.engine_on = false
        playShipAudio("assets/ship_engine_on.mp3", false)    
    }
}

function shootProjectile(){
    // console.log("Shoot projectile")

    /// Check if audio is still playing
    if(!audio_ship_laser.paused) return;
    
    let vx = ship.vx + Math.cos(ship.angle) * ship.weapon.projectile_thrust * fpsFactor();
    let vy = ship.vy + Math.sin(ship.angle) * ship.weapon.projectile_thrust * fpsFactor();
    
    space.bodies.push(new Projectile(ship.x, ship.y, vx, vy))
    playAudio("audio_ship_laser", true, "assets/laser.mp3")

    setTimeout(() => {
        playAudio("audio_ship_laser", false, "assets/laser.mp3")
    }, 500);
}