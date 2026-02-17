
// ---------- AUDIO ----------

function activateAudio(){
    
    if(ship.audio_active) return;

    ship.audio_active = true;

    if(audio_ambience.paused){       
        audio_ambience.src = "assets/ambience.mp3"
        audio_ambience.volume = 0.05
        audio_ambience.play()
    }

    setTimeout(() => {        
        welcomeMessage();
        setTimeout(() => {
            startOrder(ship.current_order);
        }, presets.welcome_message_time_ms)
    }, 500);
    
}
function playAudio(id, play=true, src){

    let audio = document.getElementById(id)

    if(audio.src !== src) audio.src = src

    if(id === "audio_explosion") audio.volume = 0.11
    else audio.volume = 0.05
    
    if(play) audio.play()
    else{
        audio.pause()
        audio.currentTime = 0
    }
}
function playShipAudio(src, play=true){
    audio_ship.src = src
    audio_ship.volume = 0.05
    if(play) audio_ship.play()
    else{
        audio_ship.pause()
        audio_ship.currentTime = 0
    }
}

function mothershipSpeak(text, force_cancel_previous=true, allow_message_stacking=true){
    speak(text, force_cancel_previous, 0, allow_message_stacking) /// 0 = Microsoft super robot
}
function shipSpeak(text, force_cancel_previous=false, allow_message_stacking=false){
    speak(text, force_cancel_previous, 5, allow_message_stacking) /// 4 = Google UK
}
function earthBroadcast(text){
    speak(text, force_cancel_previous=true, 5, allow_message_stacking=true) // 5 = british female
}
function earthSpeak(text){
    speak(text, force_cancel_previous=true, 10, allow_message_stacking=true) // 4 = indian female
}
async function speak(text, force_cancel_previous=true, voice_index=0, allow_message_stacking=false) {

    if(!allow_message_stacking && ship.console.voice_speaking){
        console.log("Someone is already speaking")
        return
    }
    ship.console.voice_speaking = true

    let voices = window.speechSynthesis.getVoices() || [];
    // console.log(`speak() voices`, voices);
    let voice = voices[voice_index];
    // console.log(`speak() voice`, voice);

    if(force_cancel_previous){
        /// Stop previous
        window.speechSynthesis.cancel();
    }    

    const utterance = new SpeechSynthesisUtterance(text);
    if(voice) utterance.voice = voice;
    utterance.volume = 0.4;
    window.speechSynthesis.speak(utterance);

    
    const characters_per_second = 10
    const ms_to_wait = text.length / characters_per_second * 1000
    console.log("speak() ms_to_wait", ms_to_wait)
    setTimeout(() => { 
        ship.console.voice_speaking = false 
    }, ms_to_wait)
}