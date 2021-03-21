var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
});
var storage;
var storageRef;
var db;
var userDetails;
window.addEventListener("load",()=>{
    // Get a reference to the storage service, which is used to create references in your storage bucket
    storage = firebase.storage();
    db = firebase.firestore();
    // Create a storage reference from our storage service
    storageRef = storage.ref();
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            db.collection("user").doc(user.uid)
            .get()
            .then((doc) => {
                if (doc.exists) {
                    document.querySelector('#uploadButton').disabled = false;
                    document.querySelector('#uploadButton').textContent = 'Upload';
                    //console.log("Document data:", doc.data());
                    userDetails = doc.data();
                    userDetails.id = user.uid;
                    initializeBreadcrumb(userDetails);
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                    window.location.replace("/");
                }            
            })
            .catch((error) => {
                console.log("Error getting documents: ", error);
            });
            // Get a reference to the storage service, which is used to create references in your storage bucket
            storage = firebase.storage();

            // Create a storage reference from our storage service
            storageRef = storage.ref();
            //document.querySelector('#uploadButton').children[0].style.display = 'none';

        } 
        else {
            window.location.href = '../login';
          console.error("you're not logged");
        }
    });
});
var obj;
var userInfo = [];
document.querySelector('#uploadFile').addEventListener('submit',e=>{
    e.preventDefault();
    let form = document.getElementById('uploadFile');
    obj={"title":form.title.value,"desc":form.desc.value,"nsfw":form.nsfw.checked};
    let file = form.file.files[0];
    if(form.checkValidity() && (file.type).includes('audio')){
        uploadFiles(file,Date.now());
    }
});

function uploadFiles(file,date){
    
    // Upload file and metadata to the object 'images/mountains.jpg'
    var uploadTask = storageRef.child('audio/'+userDetails.id+'/'+date+'/'+file.name).put(file);
    document.querySelector('#progressBar').style.display = 'flex';
    document.querySelector('#uploadFile').style.display = 'none';
    document.querySelector('#uploading').textContent = 'Uploading the file, please wait';
    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
    function(snapshot) {
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    //console.log('Upload is ' + progress + '% done');
    changeProgressBar(progress);
    //document.getElementById("progressBar").setAttribute("data-value",progress);
    switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
        break;
        case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
        break;
        }
    }, function(error) {

    // A full list of error codes is available at
    // https://firebase.google.com/docs/storage/web/handle-errors
    switch (error.code) {
        case 'storage/unauthorized':
        // User doesn't have permission to access the object
        break;

        case 'storage/canceled':
        // User canceled the upload
        break;

        case 'storage/unknown':
        // Unknown error occurred, inspect error.serverResponse
        break;
        }
    }, function() {
        // Upload completed successfully, now we can get the download URL
        uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
            obj.fileURL = downloadURL;
            obj.userId = userDetails.id;
            obj.date = date;
            obj.fileName = file.name;
            db.collection("post").add(obj)
            .then((docRef) => {
                //console.log("Document written with ID: ", docRef.id);
                document.querySelector('#progressBar').children[0].classList.toggle('bg-success');
                document.querySelector('#menuAction').style.display = 'block';
                document.querySelector('#toAudio').href = '/post/?postId='+docRef.id;
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            });
            /*firebase.database().ref('post/'+ postID).set(obj, function(error) {
                if (error) {
                console.log("error writing in database");
                } else {
                    //let options = document.createElement("div");
                    //options.classList.add("center");
                    //let text = document.createElement("h1");
                    //document.getElementById("uploadCont").reset();
                    console.log("no errors writing in database");
                    document.querySelector('#progressBar').classList.toggle('bg-success');
                    document.querySelector('#menuAction').style.display = 'block';
                    document.querySelector('#toAudio').href = '/post/?postId='+postID;
                }
            });*/
        });
    });
}
function cleanView(){
    document.querySelector('#uploading').textContent = 'Upload your audio';
    document.querySelector('#progressBar').children[0].classList.toggle('bg-success');
    document.querySelector('#progressBar').style.display = 'none';
    document.querySelector('#menuAction').style.display = 'none';
    document.querySelector('#uploadFile').style.display = 'block';
    //document.querySelector('#uploadButton').disabled = true;
    //document.querySelector('#uploadButton').childNodes[0].style.display = 'none';
    document.querySelector('#uploadFile').reset();

}
function changeProgressBar(progress){
    let bar = document.querySelector('#progressBar').children[0];
    bar.style.width = progress + "%";
    bar.setAttribute('aria-valuenow',progress);
    bar.textContent = Math.floor(progress)  + "%";
}
function initializeBreadcrumb(obj){
    let breadcrumb = document.querySelector('#breadcrumb');
    let userElement = document.createElement('li');
    let userLink = document.createElement('a');
    userElement.classList.add('breadcrumb-item');
    userLink.classList.add('link-dark');
    userLink.href = '/u/?id='+obj.id;
    userLink.textContent = obj.username;

    userElement.appendChild(userLink);
    breadcrumb.appendChild(userElement);

    let postElement = document.createElement('li');
    postElement.textContent = 'upload your audio';
    postElement.classList.add('breadcrumb-item','active');
    postElement.setAttribute('aria-current','page');

    breadcrumb.appendChild(postElement);
}
