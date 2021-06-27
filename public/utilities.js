var db = null; 
var storage = null;
var auth = null;
window.addEventListener('load',()=>{
    db = firebase.firestore(); 
    storage = firebase.storage();
    auth = firebase.auth();
    auth.onAuthStateChanged((user)=>{
        menuOptions(user);
    });
});

/*MENU UTILITIES */

//Get the user logged info and check if there are any user logged in the app null if there no user logged.
function user(){
    const user = auth.currentUser;
    return user;
}

//fill the menu profile options and show depends on auth 
function menuOptions(user){
    if(user){
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
    else{
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
}

//Logout function, logout user.
function logout(){
    firebase.auth().signOut().then(() => {

    }).catch((error) => {
        // An error happened.
    });
}

var myDropdown = document.getElementById('myDropdown');
myDropdown.addEventListener('show.bs.dropdown', function () {
    document.getElementById('dropdownMenuButton').classList.remove('bi-person');
    document.getElementById('dropdownMenuButton').classList.add('bi-person-fill');
});
myDropdown.addEventListener('hide.bs.dropdown', function () {
    document.getElementById('dropdownMenuButton').classList.remove('bi-person-fill');
    document.getElementById('dropdownMenuButton').classList.add('bi-person');
});

//Login using email and password
document.getElementsByTagName('form')[0].addEventListener('submit',(event)=>{
    event.preventDefault();
    const form = event.target;
    //console.log(form);
    if((event.target).checkValidity()){
        auth.signInWithEmailAndPassword(form.email.value, form.password.value)
        .then((userCredential) => {
            // Signed in
            var user = userCredential.user;
            console.log(user);
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
//Login using google
function loginUsingGoogle(){
    var provider = new firebase.auth.GoogleAuthProvider();
    auth.languageCode = (navigator.language).substr(0,(navigator.language).indexOf('-')) || (navigator.userLanguage).substr(0,(navigator.userLanguage).indexOf('-'));
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
        //userLogged();
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


/* GENERAL UTILITIES */

//Gives the difference between the current date and the date in the post, if the difference is more than a month just show the date.
function daysAgo(date){
    var difference = Date.now() - date;

    var daysDifference = Math.floor(difference/1000/60/60/24);
    difference -= daysDifference*1000*60*60*24

    var hoursDifference = Math.floor(difference/1000/60/60);
    difference -= hoursDifference*1000*60*60

    var minutesDifference = Math.floor(difference/1000/60);
    difference -= minutesDifference*1000*60

    var secondsDifference = Math.floor(difference/1000);

    if(daysDifference>30){
        return (new Date(date)).toDateString();
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

function charCounter(str){
    let total = str.length;
    return total;
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
        },1000);
    }
    else{
        setTimeout(()=>{
            bsAlert.close();
        },time);
    }
}

