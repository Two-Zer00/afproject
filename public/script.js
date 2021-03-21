var users=new Array();
var parentContainer = document.querySelector('#parentContainer');
var content = parentContainer.children[1];

window.addEventListener('load',()=>{
    db = firebase.firestore();
    
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            userLogged();
        } else {
            userNotLogged();
        }
      });
      

    db.collection("user").limit(10)
    .get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            let obj = doc.data();
            obj.id=doc.id;
            users.push(obj);
            createElementUser(obj);
        });
        let spinners = document.getElementById('post').querySelector('#spinner');
        spinners.remove();
    })
    .catch((error) => {
        console.log("Error getting documents: ", error);
    });
    db.collection("post").orderBy('date','desc').limit(10)
    .get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            createElement(doc.id,doc.data());
        });
        let spinners = document.getElementById('user').querySelector('#spinner');
        spinners.remove();
    })
    .catch((error) => {
        console.log("Error getting documents: ", error);
    });
});

function createElement(id,obj){
    let element = document.createElement('a');
    element.classList.add('list-group-item', 'list-group-item-action');
    element.href = 'post/?postId=' + id;

    let container = document.createElement('div');
    container.classList.add('row');

    let profileImageContaner = document.createElement('div');
    profileImageContaner.classList.add('col-1','p-0');
    profileImageContaner.style.width = '80px';
    let imageContainer = document.createElement('div');
    imageContainer.classList.add('rounded-circle','overflow-hidden','border','border-3','load','position-relative');
    imageContainer.style.height = "80px";
    let profileImage = document.createElement('img');
    profileImage.style.height = '100%';
    profileImage.classList.add('bg-white');
    getImagesURL(obj.userId,profileImage);
    imageContainer.appendChild(profileImage);
    profileImageContaner.appendChild(imageContainer);

    container.appendChild(profileImageContaner);

    let postContainer = document.createElement('div');
    postContainer.classList.add('col','text-truncate');


    let subElement = document.createElement('div');
    subElement.classList.add('d-flex', 'w-100', 'justify-content-between');

    let subElement1 = document.createElement('h5');
    subElement1.classList.add('mb-1');
    subElement1.textContent = obj.title || obj.user[0];
    let subElement2 = document.createElement('small');
    subElement2.textContent = daysAgo(obj.date);

    subElement.appendChild(subElement1);
    subElement.appendChild(subElement2);
    
    let subElement3 = document.createElement('p');
    subElement3.classList.add('mb-1');
    subElement3.style.overflow = 'hidden';
    subElement3.style.textOverflow = 'ellipsis';
    subElement3.textContent = obj.desc;

    let subElement4 = document.createElement('small');
    subElement4.classList.add('text-muted');
    subElement4.textContent = getUsernameFromId(obj.userId) || obj.userId;

    postContainer.appendChild(subElement);
    postContainer.appendChild(subElement3);
    postContainer.appendChild(subElement4);


    container.appendChild(postContainer);
    element.appendChild(container);
    document.querySelector('#listContent').appendChild(element);
}

function daysAgo(date){
    var difference = Date.now() - date;

    var daysDifference = Math.floor(difference/1000/60/60/24);
    difference -= daysDifference*1000*60*60*24

    var hoursDifference = Math.floor(difference/1000/60/60);
    difference -= hoursDifference*1000*60*60

    var minutesDifference = Math.floor(difference/1000/60);
    difference -= minutesDifference*1000*60

    var secondsDifference = Math.floor(difference/1000);

    /*console.log('difference = ' + 
      daysDifference + ' day/s ' + 
      hoursDifference + ' hour/s ' + 
      minutesDifference + ' minute/s ' + 
      secondsDifference + ' second/s ');*/

    if(daysDifference>30){
        return (new Date(date)).toLocaleTimeString();
    }
    else if(daysDifference>0){
        return daysDifference + ' day/s ago';
    }
    else if(hoursDifference>0){
        return hoursDifference+ ' hour/s ago';
    }
    else if(minutesDifference>0){
        return minutesDifference+ ' minute/s ago';
    }
    else if(secondsDifference>0){
        return secondsDifference+ ' second/s ago';
    }
    
}

function checkUser(user){
    let val=false;
    if(users.length>0){
        for(var i=0;i<users.length;i++){
            //console.log("////",user,users[i],_.isEqual(user,users[i]));
            if(_.isEqual(user,users[i])){
                val =true;
                break;
            }
        }
        if(!val){
            users.push(user);
            return true;
        }
        else{
            return false;
        }
    }
    else{
        users.push(user);
        return true;
    }

}
function sortObj(obj) {
    console.log(obj);
    let newOBj = Object.entries(obj);
    const sortable = Object.entries(newOBj)
    .sort(([,a],[,b]) => b-a)
    .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
    console.log(newOBj);
    return sortable[1];
}

function createElementUser(obj){
    let element = document.createElement('a');
    element.href = "u/?id="+obj.id;
    element.textContent = obj.username;
    element.classList.add('list-group-item', 'list-group-item-action');
    document.querySelector('#listUsers').appendChild(element);
}

function userLogged(){
    console.log('logged')
    let navAction = document.querySelector('#dropdown');
    for(const item of navAction.children){
        item.style.display = 'none';
    }
    let profileElement = document.createElement('a');
    profileElement.href = '/u';
    profileElement.textContent = 'My profile';
    profileElement.classList.add('dropdown-item');
    let uploadElement = document.createElement('a');
    uploadElement.href = '/upload';
    uploadElement.textContent = 'Upload';
    uploadElement.classList.add('dropdown-item');

    let signOutElement = document.createElement('a');
    signOutElement.classList.add('dropdown-item');
    signOutElement.href = "javascript:void(0)";
    signOutElement.textContent = 'Sign Out';
    signOutElement.setAttribute('onclick','logout()');
    navAction.appendChild(profileElement);
    navAction.appendChild(uploadElement);
    navAction.appendChild(signOutElement);
}
function userNotLogged(){
    console.log('not logged');
    let navAction = document.querySelector('#dropdown');
    for(const item of navAction.children){
        if(item != navAction.querySelector('#loginForm') || item != navAction.querySelector('#signUp') || item != navAction.querySelector('.dropdown-divider')){
            item.style.display = 'none';
        }
    }
    navAction.querySelector('#loginForm').style.display = 'block';
    navAction.querySelector('#signUp').style.display = 'block';
    navAction.querySelector('.dropdown-divider').style.display = 'block';
}

function logout(){
    firebase.auth().signOut().then(() => {
    userNotLogged();
    }).catch((error) => {
        // An error happened.
    });
}
function getUsernameFromId(id){
    let username;
    //console.warn(id);
    for(let i=0;i<users.length;i++){
        
        if(users[i].id===id){
            //console.warn(users[i].id,id);
            username=users[i].username;
        }
    }
    return username;
}
let userProfileImage = new Array();
function getImagesURL(id,element){
    firebase.storage().refFromURL('gs://af-project-3d9e5.appspot.com/userPhotos/'+id+'/profileImage.jpg').getDownloadURL().then((url)=>{
        element.src = url;
        element.parentElement.classList.remove('load');
    }).catch((error)=>{
        console.error(error);
        element.src = '/staticFiles/profileImageDefault.jpg';
        element.parentElement.parentElement.classList.remove('load');
    });
}

document.getElementsByTagName('form')[0].addEventListener('submit',(event)=>{
    event.preventDefault();
    const form = event.target;
    console.log(form);
    if((event.target).checkValidity()){
        firebase.auth().signInWithEmailAndPassword(form.email.value, form.password.value)
        .then((userCredential) => {
            // Signed in
            var user = userCredential.user;
            console.log(user);
            userLogged();
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(error);
            form.querySelector('#messages').textContent = errorMessage;
            setTimeout(()=>{
                form.querySelector('#messages').textContent = '';
            },3000);
        });
    }
});

function loginUsingGoogle(){
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().languageCode = (navigator.language).substr(0,(navigator.language).indexOf('-')) || (navigator.userLanguage).substr(0,(navigator.userLanguage).indexOf('-'));
    //console.log((navigator.language).substr(0,(navigator.language).indexOf('-')) || (navigator.userLanguage).substr(0,(navigator.userLanguage).indexOf('-')));
    firebase.auth()
    .signInWithPopup(provider)
    .then((result) => {
        /** @type {firebase.auth.OAuthCredential} */
        var credential = result.credential;

        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        // ...
        console.warn(result.user);
        userLogged();
    }).catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        console.error(error);
        // ...
    });
}
document.querySelector('.dropdown-menu').addEventListener('click',(e)=>{
    e.stopPropagation();
});
  