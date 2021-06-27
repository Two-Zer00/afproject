var users=new Array();
var parentContainer = document.querySelector('#parentContainer');
var content = parentContainer.children[1];

window.addEventListener('load',()=>{
    db = firebase.firestore(); 
    db.collection("user").limit(10).get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            let obj = doc.data();
            obj.id=doc.id;
            users.push(obj);
            createElementUser(obj);
        });
        let spinners = document.getElementById('post').querySelector('#spinner');
        spinners.remove();
    }).catch((error) => {
        console.log("Error getting documents: ", error);
    });
    db.collection("post").orderBy('date','desc').limit(10).get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            createElement(doc.id,doc.data());
        });
        let spinners = document.getElementById('user').querySelector('#spinner');
        spinners.remove();
    }).catch((error) => {
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
    if((daysAgo(obj.date)).indexOf("ago")!=-1){
        subElement2.title = (new Date(obj.date)).toLocaleString();
    }
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
function createElementUser(obj){
    let element = document.createElement('a');
    element.href = "u?id="+obj.id;
    element.textContent = obj.username;
    element.classList.add('list-group-item', 'list-group-item-action');
    document.querySelector('#listUsers').appendChild(element);
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