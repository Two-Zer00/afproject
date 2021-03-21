let searchParams = new URLSearchParams(window.location.search);
let results;
let userInfo = new Array();
var data;
let userDetails;
if(!searchParams.has('postId')){
    window.location.href = "/";
}
let id = searchParams.get("postId");


const volumeControl = document.querySelector('#volume');

var wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: 'black',
    partialRender:true,
    forceDecode:true,
    cursorWidth:2,
    skipLength:10,
    fillParent:true,
    barHeight:'5',
    barMinHeight:'10'
});


wavesurfer.on('ready', function () {
    document.querySelector('#spinner').style.display = 'none';
    document.getElementById('volumeCounter').textContent = this.backend.gainNode.gain.value;
    
});
wavesurfer.on('play', function () {
    document.getElementsByTagName('title')[0].textContent='You\'re listening '+data.title||(data.desc).substr(0,10);
});
//let playButton = document.querySelector('#play');
wavesurfer.on('audioprocess',()=>{
    //console.log(wavesurfer.isPlaying());
    if(wavesurfer.isPlaying()){
        playButton.children[0].classList.add('bi-pause');
        playButton.children[0].classList.remove('bi-play');
    }
});

wavesurfer.on('loading', progress=>{
    document.getElementById('spinner').textContent = progress + '%';
    document.getElementById('spinner').style.color = 'black';
    document.getElementById('spinner').style.zIndex = 5;
});

wavesurfer.on('pause',()=>{
    playButton.children[0].classList.add('bi-play');
    playButton.children[0].classList.remove('bi-pause');
});

volumeControl.addEventListener('input', function() {
    wavesurfer.backend.gainNode.gain.value = this.value;
    document.getElementById('volumeCounter').textContent = this.value;
    //console.log(wavesurfer.backend.gainNode.gain.value);
}, false);

// select our play button
let playButton = document.querySelector('#play');

playButton.addEventListener('click', function() {
    wavesurfer.playPause();
}, false);


window.addEventListener("load",()=>{
    let db = firebase.firestore();
    var docRef = db.collection("post").doc(id);
    docRef.get().then((doc) => {
        if (doc.exists) {
            //console.log("Document data:", doc.data());
            data = doc.data();
            initializeAudio(doc.data(),id);
            db.collection("user").doc(doc.data().userId)
                .get()
                .then((user) => {
                    if (user.exists) {
                        userDetails = user.data();
                        userDetails.id = doc.data().userId;
                        initializeBreadcrumb(userDetails,id);
                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No such document!");
                    }            
                })
                .catch((error) => {
                    console.log("Error getting documents: ", error);
                });
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
    //postRef.on('value', function(snapshot) {
       
    //});
    
});


function initializeAudio(obj,id){
    createElement(obj,id);
    //document.getElementsByTagName('title')[0].innerText+=' ' + obj.title || (obj.desc).substr(0, 10);
    var storage = firebase.storage();
    var starsRef = storage.refFromURL(obj.fileURL);
    // Get the download URL
    starsRef.getDownloadURL().then(function(url) {
        // Insert url into an <img> tag to "download"
        wavesurfer.load(url);
    }).catch(function(error) {
        console.error(error);
    
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
        case 'storage/object-not-found':
            // File doesn't exist
            break;
    
        case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;
    
        case 'storage/canceled':
            // User canceled the upload
            break;
    
        case 'storage/unknown':
            // Unknown error occurred, inspect the server response
            break;
        }
    });
    volumeControl.value = wavesurfer.backend.gainNode.gain.value;
    document.getElementById('volumeCounter').textContent = volumeControl.value;
}
function createElement(obj){
    let date = document.querySelector('#date');
    let desc=document.querySelector('#description');
    let title=document.querySelector('#title');
    desc.textContent=obj.desc;
    title.textContent=obj.title;
    date.textContent = (new Date(obj.date)).toLocaleString();
}
function initializeBreadcrumb(obj,id){
    let breadcrumb = document.querySelector('#breadcrumb');
    let userElement = document.createElement('li');
    let userLink = document.createElement('a');
    userElement.classList.add('breadcrumb-item');
    userLink.classList.add('link-dark');
    userLink.href = '/u/?id='+obj.id;
    userLink.textContent = obj.username;
    if(obj.nsfw){
        let nsfwBadge = document.createElement('span');
        nsfwBadge.classList.add('position-absolute' + 'top-0' + 'start-100' + 'translate-middle' + 'badge' + 'rounded-pill' + 'bg-danger' + 'user-select-none');
    }

    userElement.appendChild(userLink);
    breadcrumb.appendChild(userElement);

    let postElement = document.createElement('li');
    postElement.textContent = id;
    postElement.classList.add('breadcrumb-item','active');
    postElement.setAttribute('aria-current','page');

    breadcrumb.appendChild(postElement);
}