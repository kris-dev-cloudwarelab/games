

// canvas.addEventListener("pointerdown", (event) => {
//     event.preventDefault();

//     if (!ship.alive || ship.inputs_disabled) return;

//     // Left click OR touch
//     if (event.button === 0 || event.pointerType === "touch") {
//         toggleShipEngines(true);
//     }

//     // Capture pointer so we still receive events if finger moves off canvas
//     canvas.setPointerCapture(event.pointerId);
// });

// canvas.addEventListener("pointerup", (event) => {
//     if (!ship.alive || ship.inputs_disabled) return;
//     toggleShipEngines(false);
// });

// canvas.addEventListener("pointercancel", () => {
//     if (!ship.alive || ship.inputs_disabled) return;
//     toggleShipEngines(false);
// });

// canvas.addEventListener("pointermove", (e) => {
//     if (!ship.alive || ship.inputs_disabled) return;

//     const rect = canvas.getBoundingClientRect();
//     const screenX = e.clientX - rect.left;
//     const screenY = e.clientY - rect.top;

//     const { x, y } = screenToWorld(screenX, screenY);
//     ship.turnToCoordinates(x, y);
// });

// // SHOOTING
// const fireBtn = document.getElementById("fireButton");
// addEventListener("wheel", (event) => { 
//     fireBtn.dispatchEvent(new PointerEvent("pointerdown"));
// })
// fireBtn.addEventListener("pointerdown", () => {
//     if (!ship.alive || ship.inputs_disabled) return;
//     shootProjectile();
// });


// ---------- RESET ----------
window.addEventListener("keydown", e => {
  if (e.key === "r" || e.key === "R") {
    restartGame();
  }
  if(e.key === "d" || e.key === "D"){
    presets.dev = !presets.dev
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
    if(ship.upgrades.weapon.level === 0) return;
    
    let vx = ship.vx + Math.cos(ship.angle) * ship.upgrades.weapon.getProjectileThrust() * fpsFactor();
    let vy = ship.vy + Math.sin(ship.angle) * ship.upgrades.weapon.getProjectileThrust() * fpsFactor();
    
    space.bodies.push(new Projectile(ship.x, ship.y, vx, vy))
    playAudio("audio_ship_laser", true, "assets/laser.mp3")

    setTimeout(() => {
        playAudio("audio_ship_laser", false, "assets/laser.mp3")
    }, 500);
}