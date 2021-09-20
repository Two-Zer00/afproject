let searchParams = new URLSearchParams(window.location.search);
let id = searchParams.get("id");
let image = document.getElementById('profileImage');
let audio = document.getElementById('audio');
let progresss = document.getElementById("progressBar").children[0];
let volumen = document.getElementById("volumen");
let player = document.getElementById('player').children;
let checkVolume = document.getElementById('checkVolume');
volumeCheck();
let mediaMetada = new MediaMetadata({
    title: "PROJECT A",
    artist: "TWZ00",
    artwork: [{src: "podcast.jpg"}]
  });
checkVolume.addEventListener('change',()=>{
    
    volumeCheck();
});
function volumeCheck(){
    if(checkVolume.checked){
        volumen.step = '1';
        volumen.max = '100';
    }
    else{
        volumen.step = '0.1';
        volumen.max = '1';
    }
}
window.addEventListener('load',()=>{
    if(id){
        db.collection("post").doc(id).get().then((doc) => {
            if (doc.exists) {
                console.log(doc.data());
                audio.src = doc.data().fileURL;
                audio.crossOrigin="anonymous";
                audio.addEventListener('loadeddata',()=>{
                    document.getElementById('playBtn').classList.remove('disabled');
                    progresss.max = secToPorcentage(audio.duration,audio.duration);
                    document.getElementById("duration").textContent = ((audio.duration).toString()).toHHMMSS();
                });
                audio.addEventListener("timeupdate",()=>{
                    progresss.value = secToPorcentage(audio.currentTime,audio.duration);
                    document.getElementById("currentTime").textContent = ((audio.currentTime).toString()).toHHMMSS();
                });
                player.title.textContent = (doc.data()).title;
                player.date.textContent = (new Date((doc.data()).date)).toLocaleDateString();
                player.description.textContent = (doc.data()).desc;
                mediaMetada.title = player.title.textContent;
                getUserInfo(db,doc.data().userId,true);
                getImageURL(storage,doc.data().userId,image);
            } else {
                toast('post not found',2000);
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
    }
    else{
        window.location.replace('/');
    }
});
image.addEventListener('load', function() {
    const colorRGB = colorThief.getColor(image);
    const color = 'rgb('+colorRGB[0] +','+ colorRGB[1]+','+colorRGB[2]+')';
    image.parentElement.style.backgroundColor = color;
    console.log(pickTextColorBasedOnBgColorAdvanced(color,'#FFFFFF','#000000'));
    document.getElementById('shareDots').style.color = pickTextColorBasedOnBgColorAdvanced(color,'#fff','#000');
    mediaMetada.artist = userInfo.username;
    mediaMetada.artwork = [{src:image.src}];
    if ("mediaSession" in navigator){
        navigator.mediaSession.metadata = mediaMetada;
      }
      
});
const audioContext = new AudioContext();
audio.addEventListener('loadeddata',()=>{
    const track = audioContext.createMediaElementSource(audio);
    const gainNode = audioContext.createGain();
    track.connect(gainNode).connect(audioContext.destination);
    volumen.addEventListener('input',(element)=>{
        gainNode.gain.value = element.target.value;
    });
    progresss.classList.remove('pe-none');
    progresss.classList.remove('loadContainer');
});

audio.addEventListener('seeking',()=>{
    progresss.classList.add('loadContainer');
});
audio.addEventListener('seeked',()=>{
    progresss.classList.remove('loadContainer');
});

function play(element){
    if(audio.paused){
        audio.play();
        element.classList.remove('bi-play');
        element.classList.add('bi-pause-fill');
    }
    else{
        
        element.classList.remove('bi-pause-fill');
        element.classList.add('bi-play');
        audio.pause();
    }
}
function secToPorcentage(time,totalTime){
    return (time*100)/totalTime;
}
function porcentageToSecs(porcentage,totalSecs){
    return (porcentage*totalSecs)/100;
}
function pixToPorcentage(pixels,totalPixels){
    return (pixels*100)/totalPixels;
}
progresss.addEventListener("click",(event)=>{
    let rect = event.target.getBoundingClientRect();
    let x = event.clientX - rect.left; //x position within the element.
    audio.currentTime = porcentageToSecs(pixToPorcentage(x,progresss.offsetWidth),audio.duration) - audio.style.margin;
});
progresss.addEventListener("mousemove",(event)=>{
    let rect = event.target.getBoundingClientRect();
    let x = event.clientX - rect.left; //x position within the element.
    //let y = event.clientY - rect.top;  //y position within the element.
    let time = ((porcentageToSecs(pixToPorcentage(x,progresss.offsetWidth),audio.duration) - audio.style.margin).toString()).toHHMMSS();
    let timerContainer = event.target.parentElement.querySelector('#timer');
    timerContainer.textContent = time;
    timerContainer.style.top = ((-5)-timerContainer.offsetHeight).toFixed(0)+'px';
    let temp = (Math.round(x+.25)<(event.target.offsetWidth-timerContainer.offsetWidth))?(Math.round(x+.25)-timerContainer.offsetWidth/2):(Math.round(event.target.offsetWidth-timerContainer.offsetWidth));
    // /console.log(temp);
    timerContainer.style.left = (temp).toFixed(0) + 'px';
});
progresss.addEventListener('mouseenter',(event)=>{
    let timerContainer = event.target.parentElement.querySelector('#timer');
    timerContainer.classList.remove('d-none');
    timerContainer.classList.add('d-block');
});
progresss.addEventListener("mouseleave",(event)=>{
    let timerContainer = event.target.parentElement.querySelector('#timer');
    timerContainer.classList.remove('d-block');
    timerContainer.classList.add('d-none');
});