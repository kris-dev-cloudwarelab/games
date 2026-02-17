

// ---------- PHYSICS ----------

function updatePhysics(){
    space.bodies.forEach(p => p.update());
    space.bodies_noninteractive.forEach(p => p.update());
    ship.update();

    applyAllCollisions();
    applyAllGravity();

}
function applyAllGravity(){

    /// NEW AND FAST
    const bodies_with_gravity= [...space.bodies.filter(b => b.gravity_applies || b.mass)];
    for(i=0; i<bodies_with_gravity.length; i++) {
        const b = bodies_with_gravity[i];

        /// Apply gravity to ship
        applyGravity(ship, b);

        /// Apply gravity to others
        for(j=i+1; j<bodies_with_gravity.length; j++) {
            const b2 = bodies_with_gravity[j];
            applyGravity(b2, b);
            applyGravity(b, b2);
        }        
    }
}
function applyGravity(body, body2) {

    if(body === body2) return
    if(!body.gravity_applies) return
    if(!body2?.mass) return 

    const mass = body2.mass;
    const x = body2.x;
    const y = body2.y;

    const dx = x - body.x;
    const dy = y - body.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    /// If too far, then dont need to do math
    if(dist >= presets.space.gravity_cutoff_distances.max) return;
    /// If too close, then skip
    if(dist <= presets.space.gravity_cutoff_distances.min || dist<body2.radius*0.7) return;


    const Gfps = space.G * fpsFactor();
    const force = Gfps * mass / (dist * dist);
    body.vx += force * dx / dist;
    body.vy += force * dy / dist;
}

function applyAllCollisions(){
    
    /// Need to make a copy in case the array gets modified
    const bodies_with_collision = [...space.bodies.filter(b => b.collides)];
    for(i=0; i<bodies_with_collision.length; i++) {
        const b = bodies_with_collision[i];
        checkCollisionsForBodies(b, ship);
        for(j=i+1; j<bodies_with_collision.length; j++) {
            const b2 = bodies_with_collision[j];
            checkCollisionsForBodies(b, b2);
        }
    }
}
function checkCollisionsForBodies(b, b2) {
    if(!b.collides || !b2.collides) return

    const dx = b.x - b2.x;
    const dy = b.y - b2.y;
    if (Math.sqrt(dx * dx + dy * dy) < b.radius + b2.radius) {
        // console.log("Collision detected between", b.type, "and", b2.type);
        b.collisionDetected(b2);
        b2.collisionDetected(b);
    }
}


function generateGalaxy(options = { announcement: true }){
    
    // console.log(`generateGalaxy() space.galaxy`, space.galaxy);   
    if(options.announcement){
        let message = `Entering galaxy ${getGalaxyName(space.galaxy.x, space.galaxy.y)}.`
        message = message.replace("-", "-minus")
        shipSpeak(message, false, true);
    };

    /// Keep a non-destruction radius to keep consistency
    space.bodies = space.bodies.filter(b => mustRespawnInNextGalaxy(b)); /// Untouchables
    space.bodies_noninteractive = space.bodies_noninteractive.filter(b => mustRespawnInNextGalaxy(b));
    // console.log("generateGalaxy() space.bodies_noninteractive", space.bodies_noninteractive);
    const background_star_count = space.bodies_noninteractive.filter(b => b.type === "background_star").length;
    const background_stars_needed = presets.space.background_stars - background_star_count;
    // console.log("generateGalaxy() background_stars_needed", background_stars_needed);

    /// Add background stars
    for(let i=0; i<background_stars_needed; i++) {
        /// Add full screen padding to each side to prevent the player seeing black space
        let start_x = 0// - canvas.width;
        let end_x = space.x// + canvas.width;
        let start_y = 0// - canvas.height;
        let end_y = space.y// + canvas.height;
        let x = start_x + Math.random() * (end_x - start_x);
        let y = start_y + Math.random() * (end_y - start_y);
        space.bodies_noninteractive.push(new BackgroundStar(x, y));
    }

    if(isFinalGalaxy()){
        addFinalGalaxy();
    }else if(space.galaxy.x === 0 && space.galaxy.y === 0) {
        
        /// Starting galaxy

        /// Test star system
        // space.bodies.push(...spawnSolarSystem(getRandomNumberOfPlanets(), 500+space.y/2, 500+space.x/2));

        /// Add Mothership
        mothership = new Mothership(space.x/2, space.y/2)
        space.bodies.push(mothership);

        /// 4 solar systems in the starting galaxy, so one every direction
        const spread_distance = 3000;
        space.bodies.push(...spawnSolarSystem(getRandomNumberOfPlanets(), ship.x-spread_distance, ship.y));
        space.bodies.push(...spawnSolarSystem(getRandomNumberOfPlanets(), ship.x+spread_distance, ship.y));
        space.bodies.push(...spawnSolarSystem(getRandomNumberOfPlanets(), ship.x, ship.y+spread_distance));
        space.bodies.push(...spawnSolarSystem(getRandomNumberOfPlanets(), ship.x, ship.y-spread_distance));
    }else{
        /// Add solar systems
        const number_of_solar_systems = getRandomNumberOfPlanets();
        for(let i=0; i<number_of_solar_systems; i++) {
            const number_of_planets = presets.solar_system.planet_count.min + Math.floor(Math.random() * presets.solar_system.planet_count.deviation);
            space.bodies.push(...spawnSolarSystem(number_of_planets));
        }
    }

    
    
}

function getRandomNumberOfPlanets(){
    return presets.solar_system.planet_count.min + Math.floor(Math.random() * presets.solar_system.planet_count.deviation);
}


function addFinalGalaxy(){
    
    /// Only one solar system in the final galaxy - copy of the sun and Earth
    const star = new Star(space.x/2 , space.y/2, 10*1000, 200, "yellow");
    space.bodies.push(star);

    /// Planets around the sun

    /// Mercury
    space.bodies.push(new Planet(star, 260, 20, 0.002, "Mercury", planet_images[0]));
    /// Venus
    space.bodies.push(new Planet(star, 500, 25, 0.002, "Venus", planet_images[8]));
    /// Earth
    space.bodies.push(new Planet(star, 700, 35, 0.001, "Earth", earthImage));
    /// Mars
    space.bodies.push(new Planet(star, 900, 30, 0.001, "Mars", planet_images[7]));
    /// Jupiter
    space.bodies.push(new Planet(star, 1100, 70, 0.001, "Jupiter", planet_images[9]));
    /// Saturn
    space.bodies.push(new Planet(star, 1300, 50, 0.001, "Saturn", planet_images[10]));
    /// Uranus
    space.bodies.push(new Planet(star, 1400, 50, 0.0005, "Uranus", planet_images[4]));
    /// Neptune
    space.bodies.push(new Planet(star, 1600, 50, 0.0005, "Neptune", planet_images[11]))
    /// Pluto
    space.bodies.push(new Planet(star, 1800, 15, 0.001, "Pluto", planet_images[4]))

    
    earthBroadcast(`
        This is an emergency broadcast from planet Earth
        Due to repeated attacks from unknown Android spacecraft, Earth is quarantined
        Communication is established only with ships in the Earths orbit
        Repeat SOS Mayday
        This is an emergency broadcast from planet Earth
        Due to repeated attacks from unknown Android spacecraft, Earth is quarantined
        Communication is established only with ships in the Earths orbit
        SOS Mayday
    `, false);
}
function spawnSolarSystem(number_of_planets, x, y) {

    if(x === undefined) {x = space.x*Math.random()};
    if(y === undefined) {y = space.y*Math.random()};

    const size_coefficient = Math.random();
    const star_radius = presets.star.size.min + presets.star.size.deviation*size_coefficient;
    const star_mass = presets.star.mass.min + presets.star.mass.deviation*size_coefficient; /// R = M^0.8 => M = R^1.2
    const star = new Star(x , y, star_mass, star_radius, randomColor("star"));

    const planets = [];
    const planet_size_min = star.radius/5;
    const planet_size_deviation = star.radius/3;
    let previous_distance = star.radius + presets.solar_system.planet_distance_to_star.min;
    const planet_belt_width = presets.solar_system.planet_distance_to_star.deviation;
    const average_distance_between_planets = (planet_belt_width/number_of_planets);
    for(let i=0; i<number_of_planets; i++) {
        const size_coefficient = 0.9 + 0.1*Math.random();
        const distance = previous_distance + 0.5*average_distance_between_planets + 0.5*average_distance_between_planets*Math.random();
        previous_distance = distance;
        const distance_coefficient = distance/planet_belt_width;
        let speed = presets.planet.speed.min + presets.planet.speed.deviation*distance_coefficient;
        speed = speed * fpsFactor()
        let radius = planet_size_min + planet_size_deviation*distance_coefficient*size_coefficient        
        radius = i === 0 ? planet_size_min : radius;
        planets.push(new Planet(star, distance, radius, speed));
    }

    /// Add a few rogue asteroids
    const asteroids = [];
    const number_of_asteroids = 2 + Math.floor(Math.random() * 3);
    for(let i=0; i<number_of_asteroids; i++) {
        const xdirection = (Math.random() > 0.5 ? 1 : -1);
        const ydirection = (Math.random() > 0.5 ? 1 : -1);
        const x = star.x + xdirection*star.radius*3+ 1*star.radius*Math.random();
        const y = star.y + ydirection*star.radius*3 + 1*star.radius*Math.random();
        
        let speed_x = 0;
        let speed_y = 0;
        let speed_multiplier = 0.3;
        let speed_x_random = 0.4 + Math.random() * speed_multiplier;
        let speed_y_random = 0.4 + Math.random() * speed_multiplier;
        if(star.x < x && star.y > y){
            /// Top right, so should go up and a little to the left
            speed_x = (star.x-x) * 0.00005 - speed_x_random;        
            speed_y = (star.y-y) * 0.00005 - speed_y_random;
        }else if(star.x > x && star.y > y){
            /// Top left, so should go down and a little to the left
            speed_x = (star.x-x) * 0.00005 - speed_x_random;        
            speed_y = (star.y-y) * 0.00005 + speed_y_random;
        }else if(star.x > x && star.y < y){
            /// Bottom left, so should go down and a little to the right
            speed_x = (star.x-x) * 0.00005 + speed_x_random;        
            speed_y = (star.y-y) * 0.00005 + speed_y_random;
        }else if(star.x < x && star.y < y){
            /// Bottom right, so should go up and a little to the right
            speed_x = (star.x-x) * 0.00005 + speed_x_random;        
            speed_y = (star.y-y) * 0.00005 - speed_y_random;
        }

        const asteroid = new Asteroid(x, y, speed_x, speed_y, presets.asteroid.colors[2]);
        asteroids.push(asteroid);
    }

    return [star, ...planets, ...asteroids];
}
function addAsteroids(number_of_asteroids){
    
    for(let i=0; i<number_of_asteroids; i++) {
        const speed_x = -10 + 20* Math.random();
        const speed_y = -10 + 20* Math.random();
        let color = presets.asteroid.colors[1];
        const asteroid = new Asteroid(space.x*Math.random(), space.y*Math.random(), speed_x, speed_y, color);
        space.bodies.push(asteroid);
    }
}
function spawnAsteroidSwarm(asteroid_count, x, y, position_variation = 3000){
    
    for(let i=0; i<asteroid_count; i++) {
        const ax = x + Math.random() * position_variation - position_variation/2;
        const ay = y + Math.random() * position_variation - position_variation/2;
        const speed = 4;
        space.bodies.push(new Asteroid(ax, ay, speed, speed, presets.asteroid.colors[0], 15, presets.energy_per_orb*5, true));
    } 
}