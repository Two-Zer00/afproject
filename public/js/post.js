let searchParams = new URLSearchParams(window.location.search);
let id = searchParams.get("id");
let image = document.getElementById('profileImage');
window.addEventListener('load',()=>{
    db.collection("post").doc(id).get().then((doc) => {
        if (doc.exists) {
            //data = doc.data();
            //initializeAudio(doc.data(),id);

            let audioContainer = document.getElementById('audioContainer').children;

            audioContainer.date.textContent = (new Date((doc.data()).date)).toLocaleDateString();
            audioContainer.title.textContent = doc.data().title;
            audioContainer.description.textContent = doc.data().desc;
            audioContainer.audio.src = doc.data().fileURL;
            audioContainer.audio.addEventListener('loadeddata',()=>{
                audioContainer.audio.classList.remove('invisible');
                audioContainer.spinner.remove();
            });

            db.collection("user").doc(doc.data().userId)
                .get()
                .then((user) => {

                    loadUserInfo(user.data());
                    getImageURL(storage,user.id,image);
                    
                    // if (user.exists) {
                    //     userDetails = user.data();
                    //     userDetails.id = doc.data().userId;
                    //     //initializeBreadcrumb(userDetails,id);
                    // } else {
                    //     // doc.data() will be undefined in this case
                    //     console.log("No such document!");
                    // }            
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
});

image.addEventListener('load', function() {
    const colorRGB = colorThief.getColor(image);
    const color = 'rgb('+colorRGB[0] +','+ colorRGB[1]+','+colorRGB[2]+')';
    image.parentElement.style.backgroundColor = color;
    console.log(pickTextColorBasedOnBgColorAdvanced(color,'#FFFFFF','#000000'));
    document.getElementById('shareDots').style.color = pickTextColorBasedOnBgColorAdvanced(color,'#fff','#000');
});