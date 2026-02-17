
// ---------- STARS ----------
function randomColor(body_type) {
    if (body_type == "star") {
        return presets.star.colors[Math.floor(Math.random() * presets.star.colors.length)];
    }else if (body_type == "asteroid") {
        return presets.asteroid.colors[Math.floor(Math.random() * presets.asteroid.colors.length)];
    }
}



function spawnDust(body, fps_check=true){
    
    /// Check if framerate is above 50
    if(fps_check && space.camera.smoothedFps < 50) return;
    // console.log("spawnDust() body", body);
    let dust_x = body.x;
    let dust_y = body.y;
    let color = body.color; /// Undefined for ship
    let lifespan_ms = 5*1000;
    let radius = 0;
    let gravity_applies = false;
    let collides = false;

    if(body.type === "ship"){
        /// Dust should be spawned where the engine is 10px down from the ship center
        dust_x = body.x + Math.cos(body.angle) * -20;
        dust_y = body.y + Math.sin(body.angle) * -20;
        lifespan_ms = 2000;
        radius = 0;
        gravity_applies = true;
        collides = false;
    }

    /// Spawn dustc
    space.bodies.push(new DustParticle(dust_x, dust_y, color, lifespan_ms, gravity_applies, radius, collides));

    /// This causes weird bugs
    // if(gravity_applies){
    //     space.bodies.push(new DustParticle(dust_x, dust_y, color, lifespan_ms, gravity_applies, radius, collides));
    // }else{
    //     space.bodies_noninteractive.push(new DustParticle(dust_x, dust_y, color, lifespan_ms, gravity_applies, radius, collides));
    // }
}
function wrapBody(body) {

    let wrapped = false;
    let x_min = 0 - space.wrap_segment.x;
    let x_max = space.x + space.wrap_segment.x;
    if (body.x < x_min){
        if(body.type === "ship"){
            generateGalaxy(true, -1, 0);
        }
        body.x = x_max; 
        wrapped = true;
    } else if (body.x > x_max){
        if(body.type === "ship"){
            generateGalaxy(true, 1, 0);
        }
        body.x = x_min;
        wrapped = true;
    }

    let y_min = 0 - space.wrap_segment.y;
    let y_max = space.y + space.wrap_segment.y;
    if (body.y < y_min){
        if(body.type === "ship"){
            generateGalaxy(true, 0, -1);
        }
        body.y = y_max;
        wrapped = true;
    } else if (body.y > y_max){
        if(body.type === "ship"){
            generateGalaxy(true, 0, 1);
        }
        body.y = y_min;
        wrapped = true;
    }
    return wrapped
}




function generatePlanetName(){
  let name = presets.planet.names[Math.floor(Math.random() * presets.planet.names.length)];
  let number = Math.floor(Math.random() * 1000);
  return name + " #" + number
}