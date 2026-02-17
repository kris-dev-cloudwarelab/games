

const presets = {
    first_order_tag: "welcome",
    // first_order_tag: "asteroid_swarm", 
    // first_order_tag: "destroy_earth", 
    
    welcome_message_time_ms: 3500,
    energy_per_orb: 10,    
    starting_resources: 0*1000,
    upgrade_menu_available: false,
    mothership_health: 500,
    final_galaxy: {
        x: 2,
        y: 2
    },
    space: {
        x: 10*1000,
        y: 10*1000,
        G: 0.01,
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
