let searchParams = new URLSearchParams(window.location.search);
let id = searchParams.get("id");
let newUser = false;
let post={};
let profileUpdateFormModal = new bootstrap.Modal(document.getElementById('profileDetailsModal'));
let postUpdateFormModal = new bootstrap.Modal(document.getElementById('postOptions'));
let newProfileUpdate = new bootstrap.Modal(document.getElementById('profileDetailsModal'),{keyboard:false,backdrop:'static'});
let postInUse = '';
let postElementInUse;
var userValidate;
let clipboard = new ClipboardJS('.copyLink');
let image = document.getElementById('profileImage');
document.getElementById('profileDetailsModal').addEventListener('show.bs.modal',()=>{
    profileUpdateFormModal = bootstrap.Modal.getInstance(document.getElementById('profileDetailsModal'));
});

window.addEventListener('load',()=>{
    storage = firebase.storage();
    db = firebase.firestore(); 
    //console.log(userInfo);
    if(id && id!='undefined'){
        getUserInfo(db,id,true);
        getImageURL(storage,id,image);
    }
    firebase.auth().onAuthStateChanged(function(user) {
        console.warn('AUTH');
        if(user){
            //console.warn('USER AUTH ' + id,user.uid);
            if(id&&id===user.uid){
                //console.log(id + ' and ' + user.uid + ' are equal');
                validateUser(true);
            }
            else if(userInfo&&userInfo.id===user.uid){
                //console.log(userDetails.id + ' and ' + user.uid + ' are equal');
                validateUser(true);
            }
            else if(!id){
                console.log('Getting credential from auth');
                db.collection("user").doc(user.uid)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        userInfo = doc.data();
                        userInfo.userId = user.uid;
                        loadUserInfo(doc.data(),true);
                        getUserPosts(user.uid);
                        getImageURL(storage,user.uid,image);
                        validateUser(true);
                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No such document!");
                        userDetails = new Object();
                        userDetails.id=user.uid;
                        newUser = true;
                        let profileDetailsModal = document.getElementById('profileDetailsModal'); 
                        profileDetailsModal.getElementsByClassName('modal-header')[0].getElementsByTagName('button')[0].disabled = true;
                        profileDetailsModal.getElementsByClassName('modal-body')[0].getElementsByTagName('button')[0].disabled = true;
                        //console.warn(myModalEl.getElementsByClassName('modal-body')[0].children[1]);
                        myAlert('To enable your profile, please fill out all the field or at least the required ones(username)',5000);
                        newProfileUpdate.show();
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

clipboard.on('success', function(e) {
    toast('Link saved in clipboard!',2000,'clipboard');
});
let query;
function getUserPosts(id){
    query = db.collection("post").
    where("userId", "==" ,id)
    .limit(6);


    query.get()
    .then((querySnapshot) => {
        if(querySnapshot.docs.length>0){
            post = querySnapshot.docs;
            //first = querySnapshot.docs[0];
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

    document.getElementById('spinner').remove();
}

function createElement(id,object){
    let cardElement = document.createElement('div');
    cardElement.classList.add('card','w-100','mb-2','position-relative');
    //let cardHeader = document.createElement('div');
    //cardHeader.classList.add('card-header');

    

    let cardHeaderText = document.createElement('h5');
    cardHeaderText.classList.add('card-title');
    cardHeaderText.textContent = object.title;
    cardHeaderText.id="headerText";
    
    //cardHeader.appendChild(cardHeaderText);

    
    
    //cardElement.appendChild(cardHeader);

    let cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    let cardBodyContent = document.createElement('p');
    cardBodyContent.classList.add('card-text','text-break','m-0');
    cardBodyContent.textContent = object.desc;
    cardBodyContent.id="bodyContent";

    let dropdown = document.createElement('div');
    dropdown.classList.add('dropdown','p-3','position-absolute','top-0','end-0');
    dropdown.style.zIndex = '5';
    dropdown.style.transform = 'rotate(0)';
    let dropdownBtn = document.createElement('a');
    dropdownBtn.id = 'dropdownButton';
    dropdownBtn.classList.add('link-dark','bi','bi-three-dots-vertical','streched-link');
    dropdownBtn.setAttribute('data-bs-toggle','dropdown');
    dropdownBtn.setAttribute('aria-expanded','false');
    let dropdownList = document.createElement('ul');
    dropdownList.classList.add('dropdown-menu','dropdown-menu-end');
    dropdownList.setAttribute('aria-labelledby',dropdownBtn.id);
    
    dropdown.appendChild(dropdownBtn);
    let dropdownListElement = document.createElement('li');
    let dropdownListElementLink = document.createElement('a');
    dropdownListElementLink.classList.add('dropdown-item','bi','bi-share','link-secondary','copyLink');
    dropdownListElementLink.style.lineHeight = '100%';
    dropdownListElementLink.href = 'javascript:void(0)';
    dropdownListElementLink.textContent = ' Share';
    dropdownListElementLink.setAttribute('data-clipboard-text',(window.location.href).substr(0,(window.location.href.lastIndexOf('/')+1))+'post?id='+id);
    
    dropdownListElement.appendChild(dropdownListElementLink);
    dropdownList.appendChild(dropdownListElement);
    if(userValidate){
        dropdownListElement = document.createElement('li');
        dropdownListElementLink = document.createElement('a');
         
        dropdownListElementLink.classList.add('dropdown-item','bi','bi-pencil-square','link-secondary');
        
        dropdownListElementLink.style.lineHeight = '100%';
        dropdownListElementLink.href = 'javascript:void(0)';
        dropdownListElementLink.textContent = ' Update';
        dropdownListElementLink.setAttribute('onclick','optionsPost("'+id+'",this)');
        
        dropdownListElement.appendChild(dropdownListElementLink);
        dropdownList.appendChild(dropdownListElement);

        dropdownListElement = document.createElement('li');
        dropdownListElementLink = document.createElement('a');
        dropdownListElementLink.classList.add('dropdown-item','bi','bi-trash-fill','link-danger');
        dropdownListElementLink.style.lineHeight = '100%';
        dropdownListElementLink.href = 'javascript:void(0)';
        dropdownListElementLink.textContent = ' Delete';
        dropdownListElementLink.setAttribute('onclick','optionsPost("'+id+'",this,'+object.date+')');
        
        dropdownListElement.appendChild(dropdownListElementLink);
        dropdownList.appendChild(dropdownListElement);
        

        //dropdown.appendChild(dropdownList);
        //cardHeaderOptions.appendChild(dropdown);
        //cardHeader.appendChild(cardHeaderOptions);
        
    }
    dropdown.appendChild(dropdownList);
    cardElement.appendChild(dropdown);

    let cardBodyContent1 = document.createElement('p');
    let cardBodyContentFileName = document.createElement('small');
    cardBodyContentFileName.textContent = object.fileName;
    cardBodyContentFileName.classList.add('text-muted','text-break');
    cardBodyContent1.classList.add('card-text','text-break','text-truncate');
    cardBodyContent1.id="fileName";
    cardBodyContent1.appendChild(cardBodyContentFileName);
    
    
    
    cardBody.appendChild(cardHeaderText);
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
    cardBodyActionsPlay.href = '/post?id='+id;

    cardBodyActions.appendChild(cardBodyActionsPlay);

    cardBody.appendChild(cardBodyActions);
    cardBody.style.transform = 'rotate(0)';

    cardElement.appendChild(cardBody);
    /*let a = document.createElement('div');
    a.classList.add('col-6','mb-3');
    a.appendChild(cardElement);*/
    document.querySelector("#cardContainerParent").appendChild(cardElement);
}

function validateUser(val){
    //console.log(val);
    if(val){
        userValidate = val;
        document.getElementById('editBtn').classList.toggle('disabled');
        document.getElementById('editBtn').classList.toggle('d-none');
        document.getElementById('editImageContainer').classList.toggle('pe-none');
    }
}
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
                post.push(doc);
                createElement(doc.id,doc.data());
            });
        });
    }
}
function optionsPost(id,element,date){
    const updateContent = 
    '<form id=\"uploadFile\">' +
        '<div class=\"form-floating mb-3\">' +
            '<input type=\"text\" name=\"title\" class=\"form-control\" id=\"floatingInputGrid\" placeholder=\"title required\" required>' +
            '<label for=\"floatingInputGrid\">Title</label>' +
        '</div>' +
    ' <div class=\"row g-2\">' +
            '<div class=\"col-md\">' +
                '<div class=\"input-group mb-3\">' +
                    '<input type=\"text\" name=\"file\" class=\"form-control text-truncate\" required disabled>' +
            ' </div>' +
            '</div>' +
            '<div class=\"col-md\">' +
                '<input type=\"checkbox\" name=\"nsfw\" class=\"btn-check\" id=\"btn-check-outlined\" autocomplete=\"off\">' +
                '<label class=\"btn btn-outline-danger d-block\" for=\"btn-check-outlined\" data-bs-toggle=\"tooltip\" data-bs-placement=\"top\" title=\"is this audio NSFW?\">NSFW</label>' +
            '</div>' +
        '</div>' +
        '<div class=\"form-floating mb-3\">' +
            '<textarea class=\"form-control\" name=\"desc\" placeholder=\"Leave a comment here\" id=\"floatingTextarea2\" style=\"height:100px; max-height: 300px;\"></textarea>' +
            '<label for=\"floatingTextarea2\">Description</label>' +
        '</div>' +
    '</form>' ;
    const deleteContent = 
    '<p>Are you sure you want delete this post?</p>' ;

    let optionsModal = document.getElementById('postOptions');
    switch (((element.textContent).trim().toLowerCase())) {
        case 'update':
            console.log(id,element);
            optionsModal.querySelector('#modalTitle').textContent = 'Update post';
            optionsModal.querySelector('#modalBody').innerHTML = updateContent;
            optionsModal.querySelector('#sendButton').classList.toggle('btn-danger',false);
            optionsModal.querySelector('#sendButton').classList.toggle('btn-primary',true);
            
            optionsModal.querySelector('#sendButton').textContent = 'Save changes';
            loadUpdateForm(id,element);
            postElementInUse = (element.parentElement.parentElement.parentElement.parentElement).children[1];
            document.getElementById('sendButton').setAttribute('onclick','uploadPost()');
            postUpdateFormModal.show();
        break;
        case 'delete':
            console.log(id,element,date);
            optionsModal.querySelector('#modalTitle').textContent = 'Delete post';
            optionsModal.querySelector('#modalBody').innerHTML = deleteContent;
            optionsModal.querySelector('#sendButton').classList.toggle('btn-primary',false);
            optionsModal.querySelector('#sendButton').classList.toggle('btn-danger',true);
            optionsModal.querySelector('#sendButton').textContent = 'Delete post';
            postElementInUse = (element.parentElement.parentElement.parentElement.parentElement).children[1];
            document.getElementById('sendButton').setAttribute('onclick','deletePost(\"'+id+'\",\"'+date+'\",\"'+postElementInUse.children.fileName.textContent+'\")');
            postUpdateFormModal.show();
        break;
    }
}
function loadUpdateForm(id,element){
    //consolelog("upadting");
    //let parent = element.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
    //let text = parent.querySelectorAll('#bodyContent,#headerText,#bodyTitle');
    //console.log(text,text[0].id);
    //var updateModal = new bootstrap.Modal(document.getElementById('exampleModal'));
    let form = document.querySelector('#uploadFile');
    let obj;
    post.forEach((doc)=>{
        if(doc.id==id) obj = doc.data();
    });
    postInUse = id;
    let inputs = form.querySelectorAll('input,textarea');
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
            case 'file':
                inputs[i].value = obj.fileName;
            break;
        }
    }
}
function uploadPost(){
    let form = document.querySelector('#uploadFile');
    let spinner = document.createElement('div');
    spinner.classList.add('spinner-grow');
    spinner.style.width = '7rem';
    spinner.style.height = '7rem';
    spinner.setAttribute('role','status');
    form.parentElement.classList.add('text-center');
    form.parentElement.appendChild(spinner);
    form.style.display = 'none';

    let formLength = form.querySelectorAll('#bodyContent,#headerText,#bodyTitle').length;
    db.collection("post").doc(postInUse).update({
        desc: form.desc.value,
        nsfw: form.nsfw.checked,
        title : form.title.value
    }).then(() => {
        postElementInUse.children.headerText.textContent = form.title.value;
        postElementInUse.children.bodyContent.textContent = form.desc.value;
        if(form.nsfw.checked){
            if(!postElementInUse.querySelector('span')){
                let badge = document.createElement('span');
                badge.classList.add('badge','rounded-pill','bg-danger');
                badge.textContent = 'NSFW';
                postElementInUse.insertBefore(badge,postElementInUse.children[3]);
            }
        }
        else{
            if(postElementInUse.querySelector('span')){
                postElementInUse.querySelector('span').remove();
            }
        }
        spinner.remove();
        postUpdateFormModal.hide();
        form.remove();

    })
    .catch((error) => {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
    });
    document.getElementById('sendButton').removeAttribute('onclick');
}
function deletePost(id,date,filename){
    let spinner = document.createElement('div');
    let modalBody = document.getElementById('modalBody');
    spinner.classList.add('spinner-grow');
    spinner.style.width = '7rem';
    spinner.style.height = '7rem';
    spinner.setAttribute('role','status');
    modalBody.appendChild(spinner);
    modalBody.children[0].style.display = 'none';

    storage.ref().child('audio/'+user().uid+'/'+date+'/'+filename).delete().then(() => {
        //console.log("file: " + fileName + ' deleted');
        db.collection("post").doc(id).delete().then(() => {
            //console.log("Document successfully deleted!");
            postElementInUse.parentElement.remove();
            spinner.remove();
            postUpdateFormModal.hide();
        }).catch((error) => {
            console.error("Error removing document: ", error);
        });
    }).catch((error) => {
        console.log(error);
        if(error.code == 'storage/object-not-found'){
            db.collection("post").doc(id).delete().then(() => {
                //console.log("Document successfully deleted!");
                postElementInUse.parentElement.remove();
                postUpdateFormModal.hide();
            }).catch((error) => {
                console.error("Error removing document: ", error);
            });
        }
    });
    
    document.getElementById('sendButton').removeAttribute('onclick');
}

//EVENT LISTENERS

document.getElementById('profileDetailsModal').addEventListener('show.bs.modal', function (event) { //Profile details form
    console.log(userInfo);
    let profileDetailsform = document.getElementById('profileDetailsForm');
    profileDetailsform.email.value = user().email;
    if(!newUser){
        profileDetailsform.username.value = userInfo.username;
        profileDetailsform.gender.value = userInfo.gender;
        profileDetailsform.desc.value = userInfo.desc;
        document.getElementById('charCounter').textContent = charCounter(userInfo.desc) + '/100'
    }
    
});

document.getElementById('saveProfileBtn').addEventListener('click',()=>{ //Profile details form update button
    let profileDetailsform = document.getElementById('profileDetailsForm');
    let obj = {username:(profileDetailsform.username.value).trim(),
        gender:profileDetailsform.gender.value,
        desc:(profileDetailsform.desc.value).trim()};
    if(newUser && (profileDetailsform).checkValidity()){
        obj.creationTime = new Date(user().metadata.creationTime).getTime();
        //console.log(obj);
        db.collection("user").doc(user().uid).set(obj)
        .then(() => {
            loadUserDetails(obj);
            myAlert('Profile details created succesfully');
            setTimeout(()=>{
                profileUpdateFormModal.hide();
            },500);
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });
    }
    else if(!newUser && (profileDetailsform).checkValidity()){
        db.collection("user").doc(user().uid).update(obj)
        .then(() => {
            loadUserInfo(obj);
            toast('Profile details updated succesfully',5000,'profile updated');
            profileUpdateFormModal.hide();
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });
    }
    else{
        myAlert('Please fill out the required fields');
    }
});

window.addEventListener('scroll',()=>{ //Load next posts once you finish scroll
    var d = document.documentElement;
    var offset = d.scrollTop + window.innerHeight;
    var height = d.offsetHeight;

    //console.log(offset,height);
    if (offset >= height-1) {
        //console.log('end');
        next(last);
    }
});

document.getElementById('desc').addEventListener('input',(e)=>{
    document.getElementById('charCounter').textContent = charCounter(e.target.value) + '/100';
});

document.getElementById('editImageContainer').addEventListener('mouseover',(event)=>{
    let element = event.target;
    element.style.cursor = 'pointer';
    element.querySelector('span').classList.toggle('d-none');
    element.querySelector('span').classList.toggle('d-block');
    element.style.backgroundColor = 'rgba(255,255,255,0.3)';
});

document.getElementById('editImageContainer').addEventListener('mouseout',(event)=>{
    let element = event.target;
    element.style.cursor = 'default';
    element.querySelector('span').classList.toggle('d-none');
    element.querySelector('span').classList.toggle('d-block');
    element.style.backgroundColor = '';
});

document.getElementById('editImageContainer').addEventListener('click',(event)=>{
    let element = event.target;
    let imageInput = element.parentElement.querySelector('input');
    imageInput.click();
});

document.getElementById('profileImageInput').addEventListener('change',(event)=>{
    let spinnerCont = document.createElement('div');
    spinnerCont.classList.add('spinner-border');
    spinnerCont.style.width = '75px';
    spinnerCont.style.height = '75px';
    spinnerCont.setAttribute('role','status');
    let spinner = document.createElement('span');
    spinner.classList.add('visually-hidden');
    spinner.textContent = 'Loading...';
    spinnerCont.appendChild(spinner);
    let element = event.target;
    element.classList.add('pe-none');
    element.previousElementSibling.insertBefore(spinnerCont,element.children[0]);
    console.log(element.previousElementSibling);
    let file = element.files[0];
    let image = element.parentElement.querySelector('img');
    resize(file,200,image);
    image.onload = (el)=>{
        console.log(el.target.src);
        var uploadTask = storage.ref().child('userPhotos/'+user().uid+'/profileImage.jpg').putString(el.target.src,'data_url');

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
                console.log('Upload is running',progress);
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
                //loadImageProfileView(downloadURL);
                toast('Profile image updated successfully',2000,'img updated');
                element.classList.remove('pe-none');
                spinnerCont.remove();

            });
        }
        );
    }
});

image.addEventListener('load', function() {
    const colorRGB = colorThief.getColor(image);
    const color = 'rgb('+colorRGB[0] +','+ colorRGB[1]+','+colorRGB[2]+')';
    image.parentElement.style.backgroundColor = color;
    console.log(pickTextColorBasedOnBgColorAdvanced(color,'#FFFFFF','#000000'));
    document.getElementById('shareDots').style.color = pickTextColorBasedOnBgColorAdvanced(color,'#fff','#000');
});

