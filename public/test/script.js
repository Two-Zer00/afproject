var db;
window.addEventListener('load',()=>{
  /*db = firebase.firestore();
  db.collection("post").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        console.log(`${doc.id} => ${doc.data()}`);
    });
  });
  document.getElementById("uploadButton").disabled=false;
  document.getElementById("uploadButton").children[0].style.display = "none";
  document.getElementById("uploadButton").textContent = "Upload";*/
});

document.querySelector('#uploadFile').addEventListener('submit',e=>{
  e.preventDefault();
  let form = e.target;
  obj={"title":form.title.value,"desc":form.desc.value,"nsfw":form.nsfw.checked,"date":Date.now()};
  db.collection("post").add(obj)
  .then((docRef) => {
      console.log("Document written with ID: ", docRef.id);
  })
  .catch((error) => {
      console.error("Error adding document: ", error);
  });
  //console.log(form.file.files[0]);
  //uploadFiles(form.file.files[0],userInfo[1],Date.now());
});