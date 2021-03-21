let searchParams = new URLSearchParams(window.location.search);
let results;
let id = searchParams.get("id");
var userInfo = new Array();
var userValidate;
var objects = new Array();
var db;
var storage;
var storageRef;
var userDetails;
var newUser = false;
var myModal = new bootstrap.Modal(document.getElementById('profileDetailsModal'));
window.addEventListener("load",()=>{
    db = firebase.firestore();
    storage= firebase.storage();
    storageRef = storage.ref();
    if(id){
        db.collection("user").doc(id)
            .get()
            .then((doc) => {
                if (doc.exists) {
                    //console.log("Document data:", doc.data());
                    userDetails = doc.data();
                    userDetails.id = id;
                    storage.refFromURL('gs://af-project-3d9e5.appspot.com/userPhotos/'+userDetails.id+'/profileImage.jpg').getDownloadURL().then((url)=>{
                        //console.log(url);
                        userDetails.URLImage = url;
                        loadImageProfileView(url);
                    }).catch((error)=>{
                        console.error(error);
                        loadImageProfileView('../staticFiles/profileImageDefault.jpg');
                    });
                    storage.refFromURL('gs://af-project-3d9e5.appspot.com/userPhotos/'+userDetails.id+'/bannerImage.jpg').getDownloadURL().then((url)=>{
                        //userDetails.URLBannerImage = url;
                        loadBannerView(url);
                    }).catch((error)=>{
                        console.error(error);
                        loadBannerView('../staticFiles/profileImageDefault.jpg');
                    });
                    initializeBreadcrumb(userDetails);
                    loadUserDetails(userDetails);
                    initializeUser(userDetails.id);
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                    window.location.replace("/");
                }            
            })
            .catch((error) => {
                console.log("Error getting documents: ", error);
                
            });
    }
    firebase.auth().onAuthStateChanged(function(user) {
        console.warn('AUTH');
        if(user){
            //console.warn('USER AUTH ' + id,user.uid);
            if(id&&id===user.uid){
                //console.log(id + ' and ' + user.uid + ' are equal');
                validateUser(true);
            }
            else if(userDetails&&userDetails.id===user.uid){
                //console.log(userDetails.id + ' and ' + user.uid + ' are equal');
                validateUser(true);
            }
            else if(!id){
                console.log('Getting credential from auth');
                db.collection("user").doc(user.uid)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        //console.log("Document data:", doc.data());
                        userDetails = doc.data();
                        userDetails.id=user.uid;
                        storage.refFromURL('gs://af-project-3d9e5.appspot.com/userPhotos/'+userDetails.id+'/profileImage.jpg').getDownloadURL().then((url)=>{
                            userDetails.URLImage = url;
                            loadImageProfileView(url);
                        }).catch((error)=>{
                            console.error(error);
                            loadImageProfileView('../staticFiles/profileImageDefault.jpg');
                        });
                        storage.refFromURL('gs://af-project-3d9e5.appspot.com/userPhotos/'+userDetails.id+'/bannerImage.jpg').getDownloadURL().then((url)=>{
                            userDetails.URLBannerImage = url;
                            loadBannerView(url);
                        }).catch((error)=>{
                            console.error(error);
                            loadBannerView('../staticFiles/profileImageDefault.jpg');
                        });
                        initializeBreadcrumb(userDetails);
                        loadUserDetails(doc.data());
                        initializeUser(userDetails.id);
                        validateUser(true);
                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No such document!");
                        userDetails = new Object();
                        userDetails.id=user.uid;
                        newUser = true;
                        myModal = new bootstrap.Modal(document.getElementById('profileDetailsModal'),{keyboard:false,backdrop:'static'});
                        myModalEl.getElementsByClassName('modal-header')[0].getElementsByTagName('button')[0].disabled = true;
                        myModalEl.getElementsByClassName('modal-footer')[0].getElementsByTagName('button')[0].disabled = true;
                        //console.warn(myModalEl.getElementsByClassName('modal-body')[0].children[1]);
                        myAlert('To enable your profile, please fill out all the field or at least the required ones(username)',5000);
                        myModal.show();
                    }            
                })
                .catch((error) => {
                    console.log("Error getting documents: ", error);
                });
            }
        }
        else if(!id){
            window.location.replace('/');
        }
    });
});

var myModalEl = document.getElementById('profileDetailsModal');
myModalEl.addEventListener('show.bs.modal', function (event) {
    var user = firebase.auth().currentUser;
    let profileDetailsform = document.getElementById('profileDetailsForm');
    profileDetailsform.email.value = user.email;
    if(!newUser){
        profileDetailsform.username.value = userDetails.username;
        profileDetailsform.gender.value = userDetails.gender;
        profileDetailsform.desc.value = userDetails.desc;
        document.getElementById('charCounter').textContent = charCounter(userDetails.desc) + '/100'
    }
    storage.refFromURL('gs://af-project-3d9e5.appspot.com/userPhotos/'+userDetails.id+'/profileImage.jpg').getDownloadURL().then((url)=>{
            document.getElementById('profileDetailPhoto').src = url;
        }).catch((error)=>{
            //console.error(error);
            document.getElementById('profileDetailPhoto').src = '/staticFiles/profileImageDefault.jpg' ;
        });
    storage.refFromURL('gs://af-project-3d9e5.appspot.com/userPhotos/'+userDetails.id+'/bannerImage.jpg').getDownloadURL().then((url)=>{
        document.getElementById('profileDetailBanner').src = url;
    }).catch((error)=>{
        //console.error(error);
        document.getElementById('profileDetailBanner').src = '/staticFiles/profileImageDefault.jpg' ;
    });
    
});

document.getElementById('desc').addEventListener('input',(e)=>{
    document.getElementById('charCounter').textContent = charCounter(e.target.value) + '/100';
});


document.getElementById('profileImageForm').getElementsByTagName('button')[0].addEventListener('click',(e)=>{
    e.preventDefault();
    let image = e.target.parentElement.parentElement.profileDetailsImage.files[0];
    // Upload file and metadata to the object 'images/mountains.jpg'
    var uploadTask = storageRef.child('userPhotos/'+userDetails.id+'/profileImage.jpg').put(image);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
    (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        //console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
        case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }
    }, 
    (error) => {
        console.log(error);
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
        case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;
        case 'storage/canceled':
            // User canceled the upload
            break;

        // ...

        case 'storage/unknown':
            // Unknown error occurred, inspect error.serverResponse
            break;
        }
    }, 
    () => {
        // Upload completed successfully, now we can get the download URL
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            loadImageProfileView(downloadURL);
            myAlert('Profile image saved succesfully');

        });
    }
    );

});

function showImage(fileReader) {
    var img = document.getElementById("myImage");
    img.onload = () => getImageData(img);
    img.src = fileReader.result;
}
document.getElementById('profileBannerForm').getElementsByTagName('input')[0].addEventListener('input',(e)=>{
    //console.log(e.target.files[0]);
    var reader = new FileReader();
    reader.onload = function(e) {
        var img = document.getElementById("profileDetailBanner");
        img.src = e.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
});
document.getElementById('profileBannerForm').getElementsByTagName('button')[0].addEventListener('click',(e)=>{
    e.preventDefault();
    let image = e.target.parentElement.parentElement.profileDetailBanner.files[0];
    //console.log(image.width,image.height);
    
    // Upload file and metadata to the object 'images/mountains.jpg'
    var uploadTask = storageRef.child('userPhotos/'+userDetails.id+'/bannerImage.jpg').put(image);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
    (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        //console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
        case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }
    }, 
    (error) => {
        console.log(error);
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
        case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;
        case 'storage/canceled':
            // User canceled the upload
            break;

        // ...

        case 'storage/unknown':
            // Unknown error occurred, inspect error.serverResponse
            break;
        }
    }, 
    () => {
        // Upload completed successfully, now we can get the download URL
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            //document.getElementById('bannerImage').style.backgroundImage = 'url("'+downloadURL+'")';
            myAlert('Profile banner saved succesfully');
            loadBannerView(downloadURL);
        });
    }
    );
});
document.getElementById('saveProfileBtn').addEventListener('click',()=>{
    var user = firebase.auth().currentUser;
    let profileDetailsform = document.getElementById('profileDetailsForm');
    //console.warn(profileDetailsform.username,profileDetailsform.gender,profileDetailsform.desc);
    let obj = {username:(profileDetailsform.username.value).trim(),
        gender:profileDetailsform.gender.value,
        desc:(profileDetailsform.desc.value).trim()};

    //console.log(newUser);
    // Add a new document in collection "cities"
    if(newUser && (profileDetailsform).checkValidity()){
        obj.creationTime = new Date(user.metadata.creationTime).getTime();
        //console.log(obj);
        db.collection("user").doc(user.uid).set(obj)
        .then(() => {
            loadUserDetails(obj);
            //console.log("Document successfully created!");
            myAlert('Profile details created succesfully');
            setTimeout(()=>{
                myModal.hide();
            },500);
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });
    }
    else if(!newUser && (profileDetailsform).checkValidity()){
        db.collection("user").doc(user.uid).update(obj)
        .then(() => {
            loadUserDetails(obj);
            //console.log("Document successfully updated!");
            myAlert('Profile details updated succesfully',10000);
            myModal.hide();
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });
    }
    else{
        //console.log(profileDetailsform.reportValidity());
        myAlert('Please fill out the required fields');
    }
});

function charCounter(str){
    let total = str.length;
    return total;
}

let first;
let last;
let query;
function initializeUser(id){
    query = db.collection("post").
    where("userId", "==" ,id)
    .limit(6);


    query.get()
    .then((querySnapshot) => {
        if(querySnapshot.docs.length>0){
            objects = querySnapshot.docs;
            first = querySnapshot.docs[0];
            last = querySnapshot.docs[querySnapshot.docs.length-1];
            querySnapshot.forEach((doc,i) => {
                createElement(doc.id,doc.data());
            });
        }
        else{
            document.getElementById('cardContainerParent').textContent = 'This user had no posts yet.';
        }
        document.getElementById('cardContainerParent').classList.remove('load');
    })
    .catch((error) => {
        console.log("Error getting documents: ", error);
    });
}

function isClear(element){
    console.log(element.value);
    let cardContainer = document.getElementById('cardContainer');
    cardContainer.setAttribute('onscroll','next(this)');
    if(element.value === ''){
        while(cardContainer.children.length>0){
            cardContainer.children[cardContainer.children.length-1].remove();
        }
        objects.forEach((doc)=>{
            console.warn(doc);
            createElement(doc.id,doc.data());
        });
    }
}

function createElement(id,object){
    let cardElement = document.createElement('div');
    cardElement.classList.add('card', 'text-dark', 'bg-light');
    cardElement.style.height = '100%';
    cardElement.style.width = '100%';
    let cardHeader = document.createElement('div');
    cardHeader.classList.add('card-header');

    

    let cardHeaderText = document.createElement('div');
    cardHeaderText.classList.add('d-inline-block','text-truncate');
    cardHeaderText.style.width = '89%';
    cardHeaderText.textContent = object.title;
    cardHeaderText.id="headerText";
    
    cardHeader.appendChild(cardHeaderText);

    if(userValidate){
        let cardHeaderOptions = document.createElement('div');
        cardHeaderOptions.classList.add('d-inline-block','text-end');
        cardHeaderOptions.style.width = '10%';
        let dropdown = document.createElement('div');
        dropdown.classList.add('dropdown');
        let dropdownBtn = document.createElement('a');
        dropdownBtn.id = 'dropdownButton';
        dropdownBtn.classList.add('link-dark','bi','bi-three-dots-vertical');
        dropdownBtn.setAttribute('data-bs-toggle','dropdown');
        dropdownBtn.setAttribute('aria-expanded','false');
        let dropdownList = document.createElement('ul');
        dropdownList.classList.add('dropdown-menu');
        dropdownList.setAttribute('aria-labelledby',dropdownBtn.id);
        
        dropdown.appendChild(dropdownBtn);

        let dropdownListElement = document.createElement('li');
        let dropdownListElementLink = document.createElement('a');
        dropdownListElementLink.classList.add('dropdown-item','bi','bi-pencil-square','link-secondary');
        dropdownListElementLink.href = 'javascript:void(0)';
        dropdownListElementLink.textContent = 'update';
        dropdownListElementLink.setAttribute('onclick','updatePost("'+id+'",this)');
        
        dropdownListElement.appendChild(dropdownListElementLink);
        dropdownList.appendChild(dropdownListElement);

        dropdownListElement = document.createElement('li');
        dropdownListElementLink = document.createElement('a');
        dropdownListElementLink.classList.add('dropdown-item','bi','bi-trash-fill','link-danger');
        dropdownListElementLink.href = 'javascript:void(0)';
        dropdownListElementLink.textContent = 'delete';
        dropdownListElementLink.setAttribute('onclick','deletePost("'+id+'",this,'+object.date+')');
        
        dropdownListElement.appendChild(dropdownListElementLink);
        dropdownList.appendChild(dropdownListElement);
        

        dropdown.appendChild(dropdownList);
        cardHeaderOptions.appendChild(dropdown);
        cardHeader.appendChild(cardHeaderOptions);
    }
    
    cardElement.appendChild(cardHeader);

    let cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    let cardBodyContent = document.createElement('p');
    cardBodyContent.classList.add('card-text','text-break','m-0','text-truncate');
    cardBodyContent.textContent = object.desc;
    cardBodyContent.style.maxWidth = '300px';
    cardBodyContent.id="bodyContent";

    let cardBodyContent1 = document.createElement('p');
    let cardBodyContentFileName = document.createElement('small');
    cardBodyContentFileName.textContent = object.fileName;
    cardBodyContentFileName.classList.add('text-muted','text-break');
    cardBodyContent1.classList.add('card-text','text-break','text-truncate');
    cardBodyContent1.id="fileName";
    cardBodyContent1.appendChild(cardBodyContentFileName);
    
    
    
    cardBody.appendChild(cardBodyContent);
    cardBody.appendChild(cardBodyContent1);
    if(object.nsfw){
        let badge = document.createElement('span');
        badge.classList.add('badge','rounded-pill','bg-danger');
        badge.textContent = 'NSFW';
        cardBody.appendChild(badge);
    }


    let cardBodyActions = document.createElement('div');
    cardBodyActions.classList.add('action','d-block','text-end');

    let cardBodyActionsPlay = document.createElement('a');
    cardBodyActionsPlay.classList.add('link-dark','bi','bi-play-fill','p-1','fw-bold','fs-4','stretched-link');
    cardBodyActionsPlay.style.lineHeight = '80%';
    cardBodyActionsPlay.href = '/post/?postId='+id;

    cardBodyActions.appendChild(cardBodyActionsPlay);

    cardBody.appendChild(cardBodyActions);
    cardBody.style.transform = 'rotate(0)';

    cardElement.appendChild(cardBody);
    let a = document.createElement('div');
    a.classList.add('col-auto','mb-3');
    
    a.style.maxWidth='50%';
    a.style.minWidth = '33%';
    a.style.maxHeight='300px';
    a.style.minHeight = '100px';
    a.appendChild(cardElement);
    document.querySelector("#cardContainer").appendChild(a);
}
let objectsFull = false;
function next(item){
    console.log('scrolled to end');
    if(last){
        query
        .startAfter(item)
        .get()
        .then((querySnapshot)=>{
            last = querySnapshot.docs[querySnapshot.docs.length-1];
            //console.warn(querySnapshot.docs);
            querySnapshot.forEach((doc) => {
                createElement(doc.id,doc.data());
            });
        });
    }
}
function prev(item){
    while(document.querySelector("#cardContainer").children.length>0){
        document.querySelector("#cardContainer").removeChild(document.querySelector("#cardContainer").lastChild);
    }
    document.getElementById('spinnerCardContainer').classList.toggle('d-none');
    let result;
    objects.forEach((doc,index)=>{
        //console.log(doc.id,item.id)
        if(doc.id === item.id){
            result = index;
        }
    });
    //console.warn(result);
    let a = ((result-1)-3);
    first = objects[a];
    let startIndex;
    if(a<0){
        a = 0;
    }
    else if(result==2){
        startIndex = result;
    }
    if(a==0){
        document.getElementById('prev').classList.add('disabled');
        document.getElementById('prev').style.pointerEvents='none';
    }
    //console.log(a,result-1);
    for(a; a<=startIndex ;){
        //console.log(startIndex,a);
        createElement(objects[a].id,objects[a].data());
        a++;
        if(a==startIndex-1) break;
    }
    last = objects[a];
    document.getElementById('spinnerCardContainer').classList.toggle('d-none');
}

function loadNext(e){
    if (e.offsetHeight + e.scrollTop >= e.scrollHeight) {
        next(last);
    }
}


function initializeBreadcrumb(obj){
    document.getElementsByTagName("title")[0].innerText=obj.username + "'s profile";
    //console.info(obj);
    let breadcrumb = document.querySelector('#breadcrumb');
    let userElement = document.createElement('li');
    userElement.classList.add('breadcrumb-item','active');
    userElement.setAttribute('aria-current','page');
    userElement.textContent = obj.username;
    breadcrumb.appendChild(userElement);
}
function createElementAdmin(id,object){
    
    //console.log(id);
    let element = document.createElement('a');
    element.classList.add('list-group-item','list-group-item-action','d-flex','justify-content-between','align-items-center');
    element.href ="/post/?postId="+id;
    element.textContent = object.title||object.desc || object.user[0];
    if(object.nsfw){
    let badge = document.createElement('span');
    badge.classList.add('badge','rounded-pill','bg-danger','bi','bi-play-fill');
    badge.textContent = 'NSFW';
    element.appendChild(badge);
    }
    else{
    let playIcon = document.createElement('span');
    playIcon.classList.add('bi','bi-play-fill');
    element.appendChild(playIcon);
    }
    document.querySelector("#list").appendChild(element);
}
var dangerModal = new bootstrap.Modal(document.getElementById('dangerModal'));
var deletedPostId;
var deletedElement;
var fileName;
var datePost;
function deletePost(id,element,date){
    dangerModal.show();
    deletedPostId = id;
    deletedElement=element;
    fileName = element.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.querySelector('#fileName').textContent;
    datePost = date;
    
}
document.getElementById('delete').addEventListener('click',()=>{
    storageRef.child('audio/'+userDetails.id+'/'+datePost+'/'+fileName).delete().then(() => {
        //console.log("file: " + fileName + ' deleted');
        db.collection("post").doc(deletedPostId).delete().then(() => {
            //console.log("Document successfully deleted!");
            let parent = deletedElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
            parent.remove();
            dangerModal.hide();
        }).catch((error) => {
            console.error("Error removing document: ", error);
        });
    }).catch((error) => {
        console.log(error);
        if(error.code == 'storage/object-not-found'){
            db.collection("post").doc(deletedPostId).delete().then(() => {
                //console.log("Document successfully deleted!");
                let parent = deletedElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
                parent.remove();
                dangerModal.hide();
            }).catch((error) => {
                console.error("Error removing document: ", error);
            });
        }
    });
    
});

var updateModal = new bootstrap.Modal(document.getElementById('updateModal'));
var idPost;
var text;
function updatePost(id,element){
    //consolelog("upadting");
    let parent = element.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
    text = parent.querySelectorAll('#bodyContent,#headerText,#bodyTitle');
    //console.log(text,text[0].id);
    idPost = id;
    //var updateModal = new bootstrap.Modal(document.getElementById('exampleModal'));
    let form = document.querySelector('#uploadFile');
    //let id;
    let obj;
    //console.warn(objects);
    objects.forEach((doc)=>{
        if(doc.id==id) obj = doc.data();
    });
    /*for(const key in objects){
        //console.warn(id,key);
        if(key==id) obj = objects[key];
    }*/
    //console.warn(obj);

    let inputs = form.querySelectorAll('input,textarea');
    //let inputs = Object.assign(input, form.getElementsByTagName('input'));
    //console.log(inputs);
    for(let i=0;i<inputs.length;i++){
        switch (inputs[i].name) {
            case 'title':
                inputs[i].value = obj.title;
            break;
            case 'nsfw':
                inputs[i].checked = obj.nsfw;
            break;
            case 'desc':
                inputs[i].value = obj.desc;
            break;
        }
    }
    document.querySelector('#uploadButton').disabled = false;
    document.querySelector('#uploadButton').textContent = 'Upload';
    //document.querySelector('#uploadButton').children[0].style.display = 'none';
    updateModal.show();
}
document.querySelector('#uploadButton').addEventListener('click',e=>{
    e.preventDefault();
    let form = document.querySelector('#uploadFile');
    let spinner = document.createElement('div');
    spinner.classList.add('spinner-grow');
    spinner.style.width = '7rem';
    spinner.style.height = '7rem';
    spinner.setAttribute('role','status');
    form.parentElement.classList.add('text-center');
    form.parentElement.appendChild(spinner);
    form.style.display = 'none';

    db.collection("post").doc(idPost).update({
        desc: form.desc.value,
        nsfw: form.nsfw.checked,
        title : form.title.value
    }).then(() => {
        //console.log("Document successfully updated!");
        for(let i=0;i<text.length;i++){
            switch (text[i].id) {
                case 'headerText':
                    text[i].textContent = form.title.value;
                break;
                case 'bodyTitle':
                    text[i].textContent = form.title.value;
                break;
                case 'bodyContent':
                    text[i].textContent = form.desc.value;
                break;
            }
        }
        spinner.remove();
        form.reset();
        form.style.display = 'initial';
        updateModal.hide();
    })
    .catch((error) => {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
    });
    



    /*firebase.database().ref('post/' + idPost).update({
        desc: form.desc.value,
        nsfw: form.nsfw.checked,
        title : form.title.value
    }, (error) => {
    if (error) {
        console.log(error);
    } else {
        console.log("done");
        var myModal = new bootstrap.Modal(document.getElementById('exampleModal'));
        spinner.remove();
        myModal.hide();

    }
    });*/
});

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
function loadUserDetails(obj){
    let details = document.getElementById('profileDetails');
    console.log(details.children);
    for(let i=0;i<details.children.length;i++){
        console.log(details.children[i]);
        switch (details.children[i].id) {
            case 'profileDetailsUsername':
                details.children[i].getElementsByTagName('label')[0].textContent = obj.username || details.children[i].textContent ;
                document.getElementsByTagName("title")[0].innerText=(obj.username || details.children[i].textContent) + "'s profile";
            break;
            case 'profileMinDetails':
                if(obj.gender==0){
                    (details.children[i]).querySelector('#profileDetailsGender').textContent = 'Female'; 
                }
                else if(obj.gender==1){
                    (details.children[i]).querySelector('#profileDetailsGender').textContent = 'Male'; 
                }
                else{
                    (details.children[i]).querySelector('#profileDetailsGender').textContent = 'No specify'; 
                }
            break;
            case 'profileDetailsDesc':
                details.children[i].textContent = (obj.desc).substr(0,100)||details.children[i].textContent + '...';;
            break;
            case 'creationTime':
                if(obj.creationTime){
                    (details.children[i]).textContent = 'User from '+ (new Date(obj.creationTime || '21 Aug 2021')).toDateString();
                }
                else{
                    (details.children[i]).textContent = '';
                }
            break;
        }
    }
}
function validateUser(val){
    //console.log(val);
    if(val){
        userValidate = val;
        document.getElementById('editBtn').classList.toggle('disabled');
        document.getElementById('editBtn').classList.toggle('d-none');
    }
}
function loadBannerView(url){
    document.getElementById('bannerImage').style.filter = 'blur(4px)';
    document.getElementById('bannerImage').style.backgroundImage = 'url("'+url+'")';
    document.getElementById('bannerImage').style.backgroundColor = 'transparent';
    document.getElementById('bannerImage').style.backgroundPosition = 'center';
    document.getElementById('bannerImage').style.backgroundRepeat = 'no-repeat';
    document.getElementById('bannerImage').style.backgroundAttachment = 'center';
    document.getElementById('bannerImage').style.backgroundSize = 'cover';
    document.getElementById('bannerImage').parentElement.classList.remove('load');
}
function loadImageProfileView(url){
    document.getElementById('profilePhoto').src = url;
    document.getElementById('profileDetailPhoto').src = url;
    document.getElementById('profilePhoto').parentElement.classList.remove('load');
}
function myAlert(text,time){
    let alert = document.createElement('div');
    alert.classList.add('alert','alert-success','fade','show','position-absolute','top-0','start-50','translate-middle-x');
    alert.style.zIndex = '5';
    alert.style.width = '100%';
    alert.setAttribute('role','alert')
    alert.textContent = text;
    document.getElementById('alertContainer').appendChild(alert);
    var bsAlert = new bootstrap.Alert(alert)
    if(!time){
        setTimeout(()=>{
            bsAlert.close();
        },5000);
    }
    else{
        setTimeout(()=>{
            bsAlert.close();
        },time);
    }
}

function getIndexFromObjects(item){
    objects.forEach((doc,index)=>{
        //console.log(doc.id,item.id)
        if(doc.id === item.id){
            return index;
        }
    });
}

function search(e,element){
    let cardContainer = document.getElementById('cardContainer');
    let input = element.value;
    if((e.key==='Enter' || e.keyCode === 13) && input!=''){
        document.getElementById('cardContainer').removeAttribute('onscroll');
        while(cardContainer.children.length>0){
            cardContainer.children[cardContainer.children.length-1].remove();
        }
        console.log(element);
        db.collection("post")
        .where("userId", "==" ,id)
        .get()
        .then((querySnapshot) => {
            //console.log(querySnapshot.docs.length);
            if(querySnapshot.docs.length>1){
                querySnapshot.forEach((doc,i) => {
                    let word = doc.data().title;
                    //onsole.error(((word).toLowerCase()).indexOf(input.toLowerCase()));
                    if(((word).toLowerCase()).indexOf(input.toLowerCase())!=-1){
                        createElement(doc.id,doc.data());
                    }
                });
            }
            else if(querySnapshot.docs.length==1){
                createElement(querySnapshot.docs[0].id,querySnapshot.docs[0].data());
            }
            else{
                document.getElementById('cardContainerParent').textContent = 'This user had no posts yet.';
            }
            document.getElementById('cardContainerParent').classList.remove('load');
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });
    }
}
