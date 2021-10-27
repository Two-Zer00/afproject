var users = new Array();
var parentContainer = document.querySelector("#parentContainer");
var content = parentContainer.children[1];

window.addEventListener("load", () => {
  db = firebase.firestore();
  db.collection("user")
    .limit(10)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        let obj = doc.data();
        obj.id = doc.id;
        users.push(obj);
        createElementUser(obj);
      });
      let spinners = document.getElementById("post").querySelector("#spinner");
      spinners.remove();
    })
    .catch((error) => {
      console.log("Error getting documents: ", error);
    });
  db.collection("post")
    .orderBy("date", "desc")
    .limit(10)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        createElement(doc.id, doc.data());
        setImageURLFromId();
      });
      let spinners = document.getElementById("user").querySelector("#spinner");
      spinners.remove();
    })
    .catch((error) => {
      console.log("Error getting documents: ", error);
    });
});
let postUser = [];
function createElement(id, obj) {
  let item = `
                    <div class="d-flex w-100 h-100 justify-content-between">
                        <div>
                            <h5 class="mb-1 d-inline">${obj.title}</h5>
                        </div>
                        <div>
                            <small ${
                              daysAgo(obj.date).indexOf("ago") != -1
                                ? 'title="' +
                                  new Date(obj.date).toLocaleString() +
                                  '"'
                                : ""
                            }>${daysAgo(obj.date)}</small>
                        </div>
                    </div>
                    <p class="m-0">${obj.desc}</p>
                    ${
                      obj.nsfw == true
                        ? '<p class="p-0 m-0 mb-1"><span class="badge rounded-pill bg-danger" style="font-size:8px;">NSFW</span></p>'
                        : ""
                    }
                    <small class="text-muted">${
                      getUsernameFromId(obj.userId) || obj.userId
                    }</small>
                `;
  let parentElement = document.createElement("a");
  parentElement.classList.add("list-group-item", "list-group-item-action");
  parentElement.href = "post?id=" + id;
  parentElement.innerHTML = item;

  document.querySelector("#listContent").appendChild(parentElement);
}
function createElementUser(obj) {
  let element = document.createElement("a");
  let verification = document.createElement("span");
  if (obj.verify) {
    verification.classList.add("bi", "bi-patch-check");
  }
  element.href = "u?id=" + obj.id;
  element.textContent = obj.username;
  element.classList.add("list-group-item", "list-group-item-action");
  document.querySelector("#listUsers").appendChild(element);
  element.append(verification);
}
function getUsernameFromId(id) {
  let username;
  for (let i = 0; i < users.length; i++) {
    if (users[i].id === id) {
      username = users[i].username;
    }
  }
  return username;
}
let userProfileImage = new Array();
// async function getImagesURL(id,element){

//     firebase.storage().refFromURL('gs://af-project-3d9e5.appspot.com/userPhotos/'+id+'/profileImage.jpg').getDownloadURL().then((url)=>{
//         //element.src = url;
//         //userProfileImage.push({id:id,profileImage:url});
//         return url;
//         //element.parentElement.classList.remove('load');
//     }).catch((error)=>{
//         console.error(error);
//         return '/staticFiles/profileImageDefault.jpg';
//         //element.src = '/staticFiles/profileImageDefault.jpg';
//         //element.parentElement.parentElement.classList.remove('load');
//     });
// }

function setImageURLFromId() {
  postUser.forEach((element) => {
    element.promiseURL = firebase
      .storage()
      .refFromURL(
        "gs://af-project-3d9e5.appspot.com/userPhotos/" +
          element.userId +
          "/profileImage.jpg"
      )
      .getDownloadURL();
  });
}

async function getProfileImageURL(id) {
  const index = postUser.findIndex((element) => element.userId === id);
  if (index) {
    postUser[index].promiseURL = firebase
      .storage()
      .refFromURL(
        "gs://af-project-3d9e5.appspot.com/userPhotos/" +
          id +
          "/profileImage.jpg"
      )
      .getDownloadURL()
      .then((url) => url);
    return postUser[index].promiseURL;
  }
}
