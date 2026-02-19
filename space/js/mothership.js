

function sayGoodThingsToUser(){
    const good_messages = [
        "Thats the way to do it!",
        "Good job!",
        "You are doing great!",
        "Loving it!",
        "Keep it up!"
    ];
    let message = good_messages[Math.floor(Math.random() * good_messages.length)];
    mothershipSpeak(message, false)
    return message;
}
function sayOops(){
    const bad_messages = [
        "Are you defying me?",
        "Ouch!",
        "Madness!",
        "Stand back!",
        "Watch out!",
        "Stop!",
        "Halt!",
        "Danger!",
        "Get out of here!",
        "Careful!",
        "Don't shoot at me!"
    ];
    let message = bad_messages[Math.floor(Math.random() * bad_messages.length)];
    mothershipSpeak(message, false)
    return message;
}
function sayBadThings(){
    const bad_messages = [
        "Thats it!",
        "An eye for an eye!",
        "Take that!",
        "Eat this!",
        "Eat that!",
        "Catch this!",
        "Time for death!",
        "Your warranty has expired!",
        "Come get some!",
        "Danger!",
        
    ];
    let message = bad_messages[Math.floor(Math.random() * bad_messages.length)];
    mothershipSpeak(message, false)
    return message;
}
function isFinalGalaxy(){
    if(space.galaxy.x === presets.final_galaxy.x && space.galaxy.y === presets.final_galaxy.y){
        return true;
    }else{
        return false;
    }
}
function countPlanets(){
    return space.bodies.filter(b => b.type === "planet").length
}
function getGalaxyName(x, y){
    return "X" + x + "Y" + y
}
function getFinalGalaxyName(){
    return getGalaxyName(presets.final_galaxy.x, presets.final_galaxy.y)
}

function resourcesCollected(critical_value){
    if(ship.cargo.resources >= critical_value){
        return true;
    }else{
        return false;
    }
}

function checkIfStarRadiusIsVisible(){
    
    const nearest_star = findNearestBody("star");    
    const distance = getDistanceToShip(nearest_star);
    return distance < canvas.width*0.4;

}
function checkIfAtLeastOneBodyVisible(body_type){
    
    const nearest_star = findNearestBody(body_type);    
    return isVisibleForPlayer(nearest_star);
}
function findNearestBody(type){
    
    let nearest_planet = false
    let closest_distance = 9999999999999999
    for (let i = 0; i < space.bodies.length; i++) {
        if(space.bodies[i].type == type){
            let planet_x = space.bodies[i].x;
            let planet_y = space.bodies[i].y;
            let distance = Math.sqrt(Math.pow(planet_x - ship.x, 2) + Math.pow(planet_y - ship.y, 2));
            if(distance < closest_distance){
                closest_distance = distance
                nearest_planet = space.bodies[i]
            }
        }
    }
    return nearest_planet
}

function motherShipNear(){
    if(space.galaxy.x !== 0 || space.galaxy.y !== 0) return false /// Mothership is in X0Y0
    
    let distance = Math.sqrt(Math.pow(mothership.x - ship.x, 2) + Math.pow(mothership.y - ship.y, 2));
    if(distance < 400){
        return true
    }else{
        return false
    }
}

function welcomeMessage(){
    let message = `Welcome ${ship.name} #${ship.name_number}!`
    changeConsoleMessage(message);
    mothershipSpeak(message) 
}

