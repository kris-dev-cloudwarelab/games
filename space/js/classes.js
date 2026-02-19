

class Mothership {
  constructor (x, y){
    this.type = "mothership";
    this.zIndex = 100;
    this.x = x;
    this.y = y;
    this.radius = 250;
    this.collides = true;
    this.image = motherShipImage;
    this.color = getCSSVariable("--accent-red");
    
    this.max_health = presets.mothership_health;
    this.health = this.max_health;
    this.resources = this.max_health*presets.energy_per_orb;
    this.anger_level = 0;
  }
  update() {
    /// No changes
  }
  draw() {    
    
    if(space.galaxy.x !== 0 || space.galaxy.y !== 0) return;
    if(!this.image.complete) return;

    /// Angry red eye
    if(this.anger_level === 2){
      const eye_radius = 10;
      ctx.beginPath();
      ctx.arc(this.x, this.y, eye_radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      // ctx.fillStyle = "#fff";
      ctx.fill();

      /// Shining effect    
      const shine_radius = eye_radius*25;
      ctx.beginPath();
      ctx.arc(this.x, this.y, shine_radius, 0, Math.PI * 2);
      let gradient2= ctx.createRadialGradient(this.x, this.y, eye_radius, this.x, this.y, shine_radius);
      gradient2.addColorStop(0, hexToRgbA(this.color, 0.9));
      gradient2.addColorStop(1, hexToRgbA("#fff", 0.001));
      ctx.fillStyle = gradient2;
      ctx.fill();
    }

    ctx.save();
    ctx.translate(this.x, this.y);    
    ctx.drawImage(
        motherShipImage,
        -this.radius,
        -this.radius,
        this.radius*2, /// Width
        this.radius*2 /// Height
    );
    ctx.restore();

    drawHealthBar(this);
    
  }
  collisionDetected(other_body){
    // Nothing happens here, logic in projectile
  }
  reactToDamage(damaged_by){
      const free_shots = 5; /// Before retaliation
      if(this.health > this.max_health-free_shots){
        this.anger_level = 0;
        sayOops();
      }else if(this.health > this.max_health*0.5){
        this.anger_level = 1;
        this.shootProjectile(false);
      }else{
        this.anger_level = 2;
        this.shootProjectile(true);
      }
  }
  shootProjectile(homing){    
    /// Target projectile at ship.x, ship.y
    if(Math.random()>0.5) sayBadThings();
    let speed = 8 + 7*(this.max_health-this.health)/this.max_health;
    let vx = Math.cos(Math.atan2(ship.y - this.y, ship.x - this.x)) * speed;
    let vy = Math.sin(Math.atan2(ship.y - this.y, ship.x - this.x)) * speed;    
    let projectile = new MothershipProjectile(this.x, this.y, vx, vy, speed, homing);
    // console.log("Mothership shoot projectile");
    space.bodies.push(projectile);
  }
  killed(){
    gameOver()
  }
  destroy() {
      space.bodies.splice(space.bodies.indexOf(this), 1);
  }
}

class MothershipProjectile {
  constructor(x, y, vx=10, vy=10, speed, homing=false) {
    this.type = "mothership_projectile";
    this.zIndex = 99;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.speed = speed;
    this.radius = homing ? 20 : 10;
    this.color = homing ? getCSSVariable("--accent-red") : getCSSVariable("--accent-blue");
    this.created_at = Date.now();
    this.lifespan_ms = 6*1000;
    this.last_dust_spawn = 0;
    this.dust_spawn_ms = 500;
    this.collides = true;
    this.gravity_applies = true;
    this.danger_to_ship = true;
    this.homing = homing;
  }
  update() {
    if(this.homing && !space.game_over && ship.alive){
      this.vx = Math.cos(Math.atan2(ship.y - this.y, ship.x - this.x)) * this.speed;
      this.vy = Math.sin(Math.atan2(ship.y - this.y, ship.x - this.x)) * this.speed;  
    } 
    this.x += this.vx;
    this.y += this.vy;

    const date_now = Date.now();
    if(date_now - this.created_at > this.lifespan_ms){
      this.destroy()
    }

    /// Spawn dust every x sec
    if (this.homing && date_now - this.last_dust_spawn > this.dust_spawn_ms) {   
      this.last_dust_spawn = date_now;   
      spawnDust(this);
    }
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    /// Shining effect    
    const shine_radius = this.radius*2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, shine_radius, 0, Math.PI * 2);
    let gradient2= ctx.createRadialGradient(this.x, this.y, this.radius, this.x, this.y, shine_radius);
    gradient2.addColorStop(0, hexToRgbA(this.color, 1));
    gradient2.addColorStop(1, hexToRgbA("#fff", 0.001));
    ctx.fillStyle = gradient2;
    ctx.fill();
  }
  destroy() {
    space.bodies.splice(space.bodies.indexOf(this), 1);
  }
  collisionDetected(other_body) {
  }
}

class Star {
  constructor(x, y, mass=10*1000, radius=100, color="#f37124") {
    this.type = "star";
    this.zIndex = 100;
    this.x = x;
    this.y = y;
    this.created_at = Date.now();
    this.mass = mass;
    this.radius = radius;
    this.color = color;
    this.collides = true;
    this.shine_radius = 3000; /// this.radius*30
    this.opacity = 0;
    this.fade_in_interval = setInterval(() => {
      /// In the first x seconds, fade in
      const fade_in_ms = 4000;
      if (Date.now() - this.created_at < fade_in_ms) {
        this.opacity += 0.01;
        this.opacity = this.opacity > 1 ? 1 : this.opacity;
      }else{
        /// Base opacity on distance to ship
        const distance = getDistanceToShip(this);
        this.opacity = 1 - distance /  this.shine_radius;
      }
    }, 50);
  }

  update() {
    /// No changes
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    let gradient = ctx.createRadialGradient(this.x, this.y, this.radius*0.2, this.x, this.y, this.radius);
    gradient.addColorStop(0, "white");
    gradient.addColorStop(1, this.color);
    ctx.fillStyle = gradient;
    ctx.fill();

    /// Shining effect    
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.shine_radius, 0, Math.PI * 2);
    let gradient2 = ctx.createRadialGradient(this.x, this.y, this.radius, this.x, this.y, this.shine_radius);
    gradient2.addColorStop(0, hexToRgbA(this.color, 0.25*this.opacity));
    gradient2.addColorStop(1, hexToRgbA("#fff", 0.001*this.opacity));
    ctx.fillStyle = gradient2;
    ctx.fill();
    
  }
  collisionDetected(other_body){
    // Nothing happens
  }
  destroy(){
    space.bodies.splice(space.bodies.indexOf(this), 1);
  }
}

class BackgroundStar {
  constructor(x, y, radius=1, color="white") {
    this.type = "background_star";
    this.zIndex = 101;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.gravity_applies = false;
  }
  update() {
    /// Paralax effect
    this.x = this.x + ship.vx/2;
    this.y = this.y + ship.vy/2;
  }
  draw() {

    const ship_speed = Math.sqrt(Math.pow(ship.vx, 2) + Math.pow(ship.vy, 2));
    if(ship_speed < 3){
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }else{
      /// Draw small lines as if stars are rushing past
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      const multiplier = 2;
      ctx.lineTo(this.x + (ship.vx*multiplier), this.y + (ship.vy*multiplier));
      ctx.strokeStyle = this.color;
      ctx.stroke();
    }
  }
  destroy(){
    space.bodies_noninteractive.splice(space.bodies_noninteractive.indexOf(this), 1);
  }
}

class DustParticle {
  constructor(x, y, color="#808080", lifespan_ms, gravity_applies, radius=1, collides) {
    this.type = "dust";
    this.zIndex = 99;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = radius;
    this.color = color;
    this.created_at = Date.now();
    this.lifespan_ms = lifespan_ms;
    this.collides = collides;
    this.gravity_applies = gravity_applies;

    /// Shining effect    
    this.shine_radius = (this.radius||1)*20;
    this.reduction_interval = setInterval(() => {
      const date_now = new Date();
      const age_ms = date_now - this.created_at;
      let lifetime_left_ms = this.lifespan_ms-age_ms;
      lifetime_left_ms = lifetime_left_ms < 1 ? 1 : lifetime_left_ms; /// Never be negative
      const proportion_of_lifetime_left = lifetime_left_ms/this.lifespan_ms;
      const radius = this.radius || 1
      let shine_radius = radius*20*Math.pow(proportion_of_lifetime_left, 0.5);    
      shine_radius = shine_radius < 3 ? 3 : shine_radius;
      this.shine_radius = shine_radius;  
    }, 100)
    this.destroy_timeout = setTimeout(() => {
      this.destroy();
    }, this.lifespan_ms);
  }
  update() {
    /// No changes
    this.x += this.vx;
    this.y += this.vy;
  }
  draw() {    
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.shine_radius, 0, Math.PI * 2);
    let gradient2= ctx.createRadialGradient(this.x, this.y, this.radius, this.x, this.y, this.shine_radius);
    gradient2.addColorStop(0, hexToRgbA(this.color, 0.2));
    gradient2.addColorStop(1, hexToRgbA("#fff", 0.001));
    ctx.fillStyle = gradient2;
    ctx.fill();
  }
  collisionDetected(other_body) {
    if(other_body.type == "star") this.color = other_body.color;    
  }
  destroy() {
    clearInterval(this.reduction_interval);
    clearTimeout(this.destroy_timeout);
    space.bodies.splice(space.bodies.indexOf(this), 1);

    /// This causes weird bugs
    // if(space.bodies.indexOf(this) != -1)
    //   space.bodies.splice(space.bodies.indexOf(this), 1);
    // if(space.bodies_noninteractive.indexOf(this) != -1)
    //   space.bodies_noninteractive.splice(space.bodies_noninteractive.indexOf(this), 1);
  }
}

class Asteroid {
  constructor(x, y, vx, vy, color, radius=7, resources=presets.energy_per_orb, swarm_mode=false) {
    this.type = "asteroid";
    this.zIndex = 98;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.color = color;
    this.created_at = Date.now();
    this.collides = true;
    this.gravity_applies = swarm_mode ? false : true;
    this.dust_spawn_ms = swarm_mode ? 200 : 200;
    this.last_dust_spawn = 0;
    this.lifespan_ms = 70*1000;
    this.resources = resources

    this.destory_timeout = setTimeout(() => {
      this.destroy();
    }, this.lifespan_ms)
    this.dust_spawner = setInterval(() => {
      spawnDust(this);
    }, this.dust_spawn_ms)
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
  }
  draw() {    
    
    /// Gradient center
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    let gradient= ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
    gradient.addColorStop(0, hexToRgbA(this.color, 0.9));
    gradient.addColorStop(1, hexToRgbA("#fff", 0.001));
    ctx.fillStyle = gradient;
    ctx.fill();
  }
  collisionDetected(other_body) {
    // console.log("Asteroid.collisionDetected() other_body.type", other_body.type);
    if(other_body.type == "star") this.color = other_body.color;
    
  }
  destroy() {
    clearTimeout(this.destory_timeout)
    clearInterval(this.dust_spawner)
    space.bodies.splice(space.bodies.indexOf(this), 1);
  }
}


class Projectile {
  constructor(x, y, vx=10, vy=10) {
    this.type = "projectile";
    this.zIndex = 97;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = 3;
    this.color = getCSSVariable("--main-accent");
    this.created_at = Date.now();
    this.lifespan_ms = 3000;
    this.collides = true;
    this.gravity_applies = true;    
    this.destroy_timeout = setTimeout(() => {
      this.destroy();
    }, this.lifespan_ms);
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    /// Shining effect    
    const shine_radius = this.radius*5;
    ctx.beginPath();
    ctx.arc(this.x, this.y, shine_radius, 0, Math.PI * 2);
    let gradient2= ctx.createRadialGradient(this.x, this.y, this.radius, this.x, this.y, shine_radius);
    gradient2.addColorStop(0, hexToRgbA(this.color, 0.2));
    gradient2.addColorStop(1, hexToRgbA("#fff", 0.001));
    ctx.fillStyle = gradient2;
    ctx.fill();
  }
  collisionDetected(other_body) {
    if(other_body.type == "planet" || other_body.type == "mothership" || other_body.type == "npc") {
      
      /// Destroy projectile      
      console.log("Projectile hit a target");    
      this.destroy()
      
      const health_after_hit = other_body.health - ship.upgrades.weapon.getProjectileDamage();
      if(health_after_hit > 0){
        other_body.health = health_after_hit;
        playAudio("audio_explosion", true, "assets/ship_projectile_hit.mp3")
        other_body.reactToDamage(this)
      }else{
        other_body.health = 0;
        other_body.killed();
      }

    }
  }
  destroy() {
      clearTimeout(this.destroy_timeout)
      space.bodies.splice(space.bodies.indexOf(this), 1);
  }
}

class Planet {
  constructor(star, distance, radius, speed, name=generatePlanetName(), image=randomPlanetImage()) {
    this.type = "planet";
    this.zIndex = 90;
    this.image = image;
    this.star = star;
    this.distance = distance;
    this.speed = speed;
    this.orbit_angle = Math.random() * Math.PI * 2; 
    this.angle = Math.random() * Math.PI * 2; /// Self rotation
    this.collides = true;
    this.gravity_applies = false;
    this.name = name;

    this.radius = radius;
    this.mass = this.planetMass(radius);
    this.max_health = Math.round(this.mass/presets.planet.mass_per_health_unit);
    this.health = this.max_health;
    this.resources = this.max_health*presets.planet.resources_per_health_unit;
  }

  planetMass(radius, density = 0.01) { 
    // density default = Earth avg kg/m³
    const volume = (4 / 3) * Math.PI * (radius ** 3);
    return density * volume;
  }
  planetRadius(mass, density = 0.01) {
    const volume = mass / density;
    return Math.cbrt(volume);
  }

  update() {
    this.orbit_angle += this.speed;
    this.angle += presets.planet.rotation_speed;
  }

  get x() {
    return this.star.x + Math.cos(this.orbit_angle) * this.distance;
  }

  get y() {
    return this.star.y + Math.sin(this.orbit_angle) * this.distance;
  }
  get vx() {
    return -Math.sin(this.orbit_angle) * this.distance * this.speed;
  }

  get vy() {
    return  Math.cos(this.orbit_angle) * this.distance * this.speed;
  }
  collisionDetected(other_body) {
    /// Nothing
  }
  reactToDamage(damaged_by){
    /// Nothing
  }
  reactToDrain(drain_amount){
      let x = drain_amount/presets.energy_per_orb;
      this.spawnAsteroids(x);

      this.resources -= drain_amount;
      this.resources = this.resources < 0 ? 0 : this.resources;
      let temp_health = this.max_health - drain_amount/presets.planet.resources_per_health_unit; /// We dont substracct health directly, we just need it for math
      /// TODO: Become smaller
      // this.mass = temp_health * presets.planet.mass_per_health_unit;
      // this.radius = this.planetRadius(this.mass);
      if(this.resources === 0){        
        this.destroy();
        return; 
      }
  }
  spawnAsteroids(x){
      let color = randomColor("asteroid");
      color = presets.asteroid.colors[2]; /// energy orb blue
      for (let i = 0; i < x; i++) {
        let vx = this.vx + Math.random() * 2 - 1;
        let vy = this.vy + Math.random() * 2 - 1;
        space.bodies.push(new Asteroid(this.x, this.y, vx, vy, color));
      }    
  }
  killed(){    
      this.destroy()
      playAudio("audio_explosion", true, "assets/ship_explosion.mp3");
      ship.planet_destroyed = true;

      /// Spawn one asteroid for each X resources
      let x = this.resources/presets.energy_per_orb;
      this.spawnAsteroids(x);

      /// Final galaxy dialog      
      if(isFinalGalaxy()){
        if(countPlanets() === 1){
            let last_planet = findNearestBody("planet")
            mothershipSpeak(`Great! Only one planet left - ${last_planet.name}`, false)
        }else if(countPlanets() > 1){
            sayGoodThingsToUser()
            const planets_left = countPlanets();
            mothershipSpeak(`Only ${planets_left} planets left.`, false)
        }
      }
  }
  destroy(){
      const this_index = space.bodies.indexOf(this);
      // console.log("Planet.destroy() this_index", this_index);
      // const this_body = space.bodies[this_index];
      // console.log("Planet.destroy() this_body", this_body);
      space.bodies.splice(this_index, 1);
  }
  draw() {
    
    if(!this.image.complete) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.drawImage(
        this.image,
        -this.radius,
        -this.radius,
        this.radius*2,
        this.radius*2
    );
    ctx.restore();

    drawHealthBar(this);
  }
} 



class NPC {
  constructor(x, y, vx, vy) {
    this.type = "npc";
    this.zIndex = 10;
    this.x = x;
    this.y = y;
    this.v_max = 1.5*fpsFactor();
    this.vx = vx*fpsFactor() || getRandom(-1,1)*this.v_max;
    this.vy = vy*fpsFactor() || getRandom(-1,1)*this.v_max;
    this.created_at = Date.now();
    this.max_health = 10;
    this.health = this.max_health;
    this.draw_size = 30;
    this.radius = 15;
    this.collides = true;
    this.gravity_applies = true;
    this.color = presets.asteroid.colors[0];

    this.resources = 100;
    this.goal = "harvest";

    this.dust_spawner = setInterval(() => {
      spawnDust(this);
    }, 50)
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.angle = Math.atan2(this.vy, this.vx);

    /// Super smell move towards closest asteroid
    if(this.goal === "harvest"){
      const asteroid = findNearestBody("asteroid")
      if(asteroid){
        this.vx = Math.cos(Math.atan2(asteroid.y - this.y, asteroid.x - this.x)) * this.v_max;
        this.vy = Math.sin(Math.atan2(asteroid.y - this.y, asteroid.x - this.x)) * this.v_max;
      }      
    }

  }
  draw() {
      if (!npcImageEngineOn.complete) return; // avoid drawing before load

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle+1.6);
      // Draw image centered on ship position
      const width = this.draw_size;   // desired draw size
      const height = this.draw_size;    
      ctx.drawImage(
          npcImageEngineOn,
          -width / 2,
          -height / 2,
          width,
          height
      );
      ctx.restore();

      drawHealthBar(this);
  }
  collisionDetected(other_body) {
    if(other_body.type === "asteroid"){
      /// Collect asteroid
      this.resources += other_body.resources || 0;
      playAudio("audio_ship_collect", true, "assets/beep.mp3")
      other_body.destroy();
    }
  }
  reactToDamage(damaged_by){
    /// Incrase speed
    this.v_max += 0.5;
    /// Turn away from damage source
    const dx = damaged_by.x - this.x;
    const dy = damaged_by.y - this.y;
    const angle = Math.atan2(dy, dx);
    this.vx = Math.cos(angle) * this.v_max;
    this.vy = Math.sin(angle) * this.v_max;

    this.goal = "flee";
  }
  destroy() {
      space.bodies.splice(space.bodies.indexOf(this), 1);
      clearInterval(this.dust_spawner);
  }
  killed(){
      ship.npc_killed = true;
      playAudio("audio_explosion", true, "assets/ship_explosion.mp3");
      
      /// Spawn one asteroid for each X resources
      let x = 10;
      for (let i = 0; i < x; i++) {
        let vx = this.vx + Math.random() * 2 - 1;
        let vy = this.vy + Math.random() * 2 - 1;
        space.bodies.push(new Asteroid(this.x, this.y, vx, vy, this.color));
      }
      this.destroy()
  }
}