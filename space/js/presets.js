

const presets = {
    version: "v0.1.0",
    dev: false,
    first_mission_tag: "welcome",
    
    // first_mission_tag: "asteroid_swarm", 
    // first_mission_tag: "start_weapon",
    // first_mission_tag: "start_harvest",
    // first_mission_tag: "kill_npc",
    // first_mission_tag: "destroy_earth", 
    
    welcome_message_time_ms: 3500,
    energy_per_orb: 10,    
    starting_resources: 0*1000,
    mothership_health: 500,
    final_galaxy: {
        x: 2,
        y: 2
    },
    space: {
        x: 10*1000,
        y: 10*1000,
        G: 0.01,
        max_npc_count: 10,
        gravity_cutoff_distances: {
            min: 10, /// Closer than that and weird results will happen
            max: 1000
        },
        background_stars: 1000,
    },
    galaxy:{
        solar_system_count: {
            min: 3,
            deviation: 5
        }
    },
    solar_system: {
        planet_count: {
            min: 3,
            deviation: 6
        },
        planet_distance_to_star: {
            min: 30, /// From the outside of the star
            deviation: 1500
        }
    },
    star:{
        size: {
            min: 50,
            deviation: 100
        },
        mass: {
            min: 6*1000,
            deviation: 10*1000
        },
        colors: [
            "#f5d18c",
            "#f37124",
            "#ffb362",
            "yellow",
            "orange",
            "red",
        ]          
    },
    planet: {
        rotation_speed: 0.005,
        mass_per_health_unit: 10, /// 50 units => 1000 mass / 50 = 20 health
        resources_per_health_unit: 5, /// 100 health = 20 resources
        size: {
            min: 10, /// Depends on the star
            deviation: 20 /// Depends on the star
        },
        mass: {
            min: 200,
            deviation: 4000
        },
        speed: {
            min: 0.0002,
            deviation: 0.0008
        },
        names: [
            "Tatuin",
            "Ceres",
            "Eris",
            "Makemake",
            "Haumea",
            "Eros",
            "Io",
            "Europa",
            "Ganymede",
            "Callisto",
            "Titan",
            "Enceladus",
            "Mimas",
            "Dione",
            "Rhea",
            "Iapetus",
            "Oberon",
            "Umbriel",
            "Ludianus",
            "Janus",
            "Monkyus",
            "Yonads",
            "Ipfreely",
            "Yobum",
            "Meanus",
            "Neidtupi"
        ]
    },
    asteroid: {
        colors: [ /// RGB
            getCSSVariable("--accent-red"), /// 0 must be some type of red (due to mission)
            getCSSVariable("--accent-green"),
            getCSSVariable("--accent-blue"),
        ]
    },
    
}

presets.ship = {
    x: presets.space.x/2,
    y: presets.space.y/2,
}

const space = { 
    galaxy: { /// Like rows/rooms in wolfenstein
        x: 0,
        y: 0
    },
    x: presets.space.x, 
    y: presets.space.y, 
    wrap_segment: {
        x: canvas.width/2,
        y: canvas.height/2
    },
    G: presets.space.G, // gravitational constant
    bodies: [],
    bodies_noninteractive: [],
    camera: {
        x: 0,
        y: 0,
        lastRefreshAt: performance.now(),
        smoothedFps: 0,
        FIXED_DT: 1000/140// 60 updates per second
    }
};
