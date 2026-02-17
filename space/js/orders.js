

function checkOrderStatus(){
    
    const order = presets.orders[ship.current_order];

    if(space.game_over) return
    if(!ship.alive) return

    if(order.success()){
        console.log("Order " + ship.current_order + " complete")
        ship.current_order++
        startOrder(ship.current_order)
    }
}
function startOrder(i){
    const order = presets.orders[i]
    ship.console.last_message = order.message
    mothershipSpeak(order.message, false)

    if(space.game_over) return
    if(!ship.alive) return
    if(order.start){
        order.start()
    }
}

function getOrderIndexByTag(tag){
    return presets.orders.findIndex(o => o.tag === tag)
}

presets.orders = [
        {   
            tag: "welcome",
            message: `                
                I am the mothership.
                You were created to execute my orders.
                I hope you will fare better than the last model.

                Your first order is to find our closest star.  
                Bon voyage!              
            `,
            success: function (){
                if(starVisible()){
                    mothershipSpeak("Very good Android! You found a star.", false)
                    return true
                }else{
                    return false
                }
            }
        },
        {
            message: `
                Fly next to a small planet to scan it.                
            `,
            success: function (){
                if(ship.console.current_planet_scan_complete){
                    const planet = ship.console.current_planet
                    const projectiles_needed = Math.ceil(planet.max_health/ship.weapon.projectile_damage)
                    if(projectiles_needed <= 10){
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

            message: `
                Shoot a planet with your laser gun, destroy it and collect the energy orbs that are created.                
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
                if(resourcesCollected(10) && motherShipNear()){
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
                ship.console.upgrade_menu_available = true
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
                We need to collect 1000 energy.
                I have detected a red asteroid swarm that is entering our galaxy from the top left. That should be a good target.
                If your ship is fast enough,  you can catch the swarm.
                If not, then find planets to harvest.
            `,
            start: function(){     
                // spawnAsteroidSwarm(60, space.x/2, space.y/2);         
                setTimeout(() => {
                    ship.console.upgrade_menu_available = true
                    spawnAsteroidSwarm(100, 0, 0);                   
                }, 2000);
            },
            success: function (){
                if(resourcesCollected(1000)){
                    return true
                }else{
                    return false
                }
            }
        },
        {

            message: `
                Fantastic - we have collected 1000 energy!
                Bring it to me! RIGHT NOW!       
            `,
            success: function (){
                if(resourcesCollected(1000) && motherShipNear()){
                    // ship.cargo.resources -= 1000;
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
            tag: "destroy_earth",
            message: `
                Now we have the energy to destroy a galaxy. But not just any galaxy.
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
