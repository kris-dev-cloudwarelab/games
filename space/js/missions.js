

function checkMissionStatus(){
    
    const mission = presets.missions[ship.current_mission];

    if(space.game_over) return
    if(!ship.alive) return

    if(mission.success()){
        console.log("Mission" + ship.current_mission + " complete")
        ship.current_mission++
        startMission(ship.current_mission)
    }
}
function startMission(i){
    const mission = presets.missions[i]
    changeConsoleMessage(mission.message);
    mothershipSpeak(mission.message, false)

    if(space.game_over) return
    if(!ship.alive) return
    if(mission.start){
        mission.start()
    }
}

function getMissionIndexByTag(tag){
    return presets.missions.findIndex(o => o.tag === tag)
}

presets.missions = [
        {   
            tag: "welcome",
            message: `                
                This is my home - Galaxy ${getGalaxyName(0,0)}.
                I am the mothership.
                You were created to execute my orders.
                I hope you will fare better than the last model.
                Your first order is to find our closest star.  
                Bon voyage!              
            `,
            success: function (){
                if(checkIfStarRadiusIsVisible()){
                    mothershipSpeak("Very good Android! You found a star.", false)
                    return true
                }else{
                    return false
                }
            }
        },
        {   
            message: `                
                See if you can find an asteroid.             
            `,
            success: function (){
                if(checkIfAtLeastOneBodyVisible("asteroid")){
                    return true
                }else{
                    return false
                }
            }
        },
        {
            message: `
                Catch one of the blue asteroids to collect its energy!                
            `,
            success: function (){
                if(resourcesCollected(10)){
                    return true
                }else{
                    return false
                }
            }
        },
        {

            message: `
                Bring the energy to me! Immediately!                
            `,
            success: function (){
                if(motherShipNear()){
                    // ship.cargo.energy -= 100;
                    mothershipSpeak(`Good work ${ship.name}!`, false)
                    return true
                }else{
                    return false
                }
            }
        },
        {
            message: `                    
                Use the energy to upgrade your ships speed!
            `,
            start: function(){
                ship.upgrades.menu_available = true
            },
            success: function (){
                if(ship.upgraded){
                    return true
                }else{
                    return false
                }
            }
        },
        {
            tag: "asteroid_swarm",
            message: `                    
                We need to collect 500 energy.
                I have detected a green asteroid swarm that is entering our galaxy from the top left.
                If you are fast, you can catch some of the asteroids.
                If not, then find other asteroids to harvest.
            `,
            start: function(){        
                setTimeout(() => {
                    ship.upgrades.menu_available = true
                    spawnAsteroidSwarm(100, 1000, 1000);                   
                }, 2000);
            },
            success: function (){
                if(resourcesCollected(500)){
                    return true
                }else{
                    return false
                }
            }
        },
        {

            message: `
                Fantastic - we have collected 500 energy!
                Bring it to me! RIGHT NOW!       
            `,
            success: function (){
                if(motherShipNear()){
                    mothershipSpeak(`
                        Wonderful!
                    `)
                    return true
                }else{
                    return false
                }
            }
        },
        {   
            tag: "start_weapon",
            message: `
                I have added a weapon upgrade to your ship.
                You can shoot by scrolling your mouse.
                Your current weapon is quite weak, but you might be able to find a small planet that you can destroy.
                Fly next to a small planet to scan it.              
            `,
            start: function(){
                ship.upgrades.menu_available = true
                ship.upgrades.weapon.level = 1;
            },
            success: function (){
                if(ship.console.current_planet_scan_complete && ship.console.current_planet){
                    const planet = ship.console.current_planet
                    const projectiles_needed = Math.ceil(planet.max_health/ship.upgrades.weapon.getProjectileDamage())
                    if(projectiles_needed <= 50){
                        mothershipSpeak("This looks like a good target planet. It will take around " + projectiles_needed + " shots to destroy.", false)
                        return true                        
                    }else{
                        return false
                    }
                }else{
                    return false
                }
            }
        },
        {   
            tag: "destroy_a_planet",
            message: `
                Destroy a planet with your lasers.     
            `,
            start: function(){
                ship.upgrades.menu_available = true
            },
            success: function (){
                if(ship.planet_destroyed){
                    mothershipSpeak("You have destroyed a planet!", false)
                    return true
                }else{
                    return false
                }
            }
        },
        {   
            tag: "start_harvest",
            message: `
                Now lets learn how to harvest energy from bigger planets.
                I have added a harvest upgrade to your ship.
                Fly next to a planet to harvest it.               
            `,
            start: function(){
                ship.upgrades.menu_available = true
                ship.upgrades.harvest.level = 1;
            },
            success: function (){
                if(ship.console.current_planet_scan_complete && ship.console.current_planet){
                    let energy_drain_per_second = ship.upgrades.harvest.getEnergyDrainPerSecond();
                    let planet_energy = ship.console.current_planet.resources
                    let seconds_to_drain = Math.ceil(planet_energy/energy_drain_per_second)
                    mothershipSpeak("You are harvesting! It will take around " + seconds_to_drain + " seconds to drain this planets energy.", false)
                    return true
                }else{
                    return false
                }
            }
        },
        {

            message: `
                Your next task is to upgrade your ships weapons to at least level 4.
            `,
            success: function (){
                if(getUpgradeLevel("ship_weapon") >= 4){
                    mothershipSpeak(`
                        Belissimo!
                    `)
                    return true
                }else{
                    return false
                }
            }
        },
        {

            tag: "kill_npc",
            message: `
                Your next task is to find an enemy harvester spacecraft.
                They are usually harvesting asteroids in nearby galaxies.
                You must destroy it and collect its cargo.      
            `,
            success: function (){
                if(ship.npc_killed){
                    mothershipSpeak(`
                        You are a natural born killer!
                    `)
                    return true
                }else{
                    return false
                }
            }
        },
        {

            message: `
                Your next task is to upgrade your ships speed and weapons to level 8 or higher.
            `,
            success: function (){
                if(getUpgradeLevel("ship_weapon") >= 8 && getUpgradeLevel("ship_speed") >= 8){
                    mothershipSpeak(`
                        Now we are cooking!
                    `)
                    return true
                }else{
                    return false
                }
            }
        },
        {
            tag: "destroy_earth",
            message: `
                Now we are ready to destroy a galaxy. But not just any galaxy.
                Fly to Galaxy ${getFinalGalaxyName()}, coordinates 0,0 and destroy all the planets there.
            `,
            success: function (){
                if(isFinalGalaxy() && countPlanets() === 0){
                    return true
                }else{
                    return false
                }
            }
        },
        {

            message: `
                Congratulations!
                You have destroyed the Milky Way and all it's planets.
                Including the Earth.
                Now you can explore the universe in peace.
                Forever.
                ...
                With me.
                The mothership.
            `,
            success: function (){
                    return false
            }
        }
    ]
