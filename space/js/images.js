

const shipIdleImage = new Image();
shipIdleImage.src = "assets/ship_idle.png"; 
const shipImageEngineOn = new Image();
shipImageEngineOn.src = "assets/ship_engine_on.png"; 
const shipExplodeImage = new Image();
shipExplodeImage.src = "assets/ship_destroyed.png"; 

const motherShipImage = new Image();
motherShipImage.src = "assets/mothership.png"; 

const earthImage = new Image();
earthImage.src = "assets/earth.png"; 

/// Make array of x planets
const last_index = 11
const planet_type_count = last_index + 1
const planet_images = new Array(planet_type_count)
for (let i = 0; i < planet_type_count; i++) {
    planet_images[i] = new Image();
    planet_images[i].src = "assets/planet_" + i + ".png"; 
}


function randomPlanetImage(){
    return planet_images[Math.floor(Math.random() * planet_type_count)]
}