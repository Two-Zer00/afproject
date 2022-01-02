window.addEventListener("load", () => {
  db = firebase.firestore();
  storage = firebase.storage();
  auth = firebase.auth();
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      let userData = (await db.collection("user").doc(user.uid).get()).data();
      console.log(userData?.following);
      if (userData?.following.length > 0) {
        let followingContent = await db
          .collection("post")
          .where("userId", "in", userData.following)
          .limit(10)
          .get();
        console.log(followingContent.docs);
        postFeed(followingContent);
        document.querySelector("#spinner").remove();
      } else {
        document
          .getElementById("feedContainer")
          .classList.add("text-white", "text-center");
        document.getElementById("feedContainer").innerText =
          "You don't follow any user yet, start following to see them here.";
      }
    } else {
      window.location.replace("/");
    }
  });
});

function getUserData(id) {
  return db
    .collection("user")
    .doc(id)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return doc.data();
      } else {
        return Promise.reject("No such document!");
      }
    });
}

async function getValues(collectionName, docName) {
  console.log(collectionName, docName);
  let doc = await db.collection(collectionName).doc(docName).get();
  if (doc.exists) {
    console.log(doc.data());
    return doc.data();
  }
  throw new Error("No such document");
}

function postFeed(data) {
  if (data.size > 0) {
    data.forEach((element) => {
      //console.log(element.id, element.data());
      createCardElement(element.id, element.data());
    });
  } else {
    document
      .getElementById("feedContainer")
      .classList.add("text-light", "text-center");
    document.getElementById("feedContainer").innerText = "No more post";
  }
}
let player, audio, progress, volume, checkVolume;
async function createCardElement(id, data) {
  console.log(data);
  let username = (await db.collection("user").doc(data.userId).get()).data();
  let cardContainer = document.createElement("div");
  cardContainer.classList.add(
    "card",
    "w-100",
    "border-top-0",
    "border-start-0",
    "border-end-0",
    "rounded-0"
  );

  let card = `
  <div class="card-body">
    <div class="row">
      <div class="col-auto">
        <a href="/u?id=${data.userId}">
          <img src="${await image(
            data.userId
          )}" class="rounded-circle border border-2 user-select-none" width="80" height="80">
        </a>
      </div>
      <div class="col">
        <h5 class="card-title d-inline-block" id="title"><a href="post?id=${id}" class='link-light text-decoration-none'>${
    data.title
  }</a>
  </h5>
  ${
    data.nsfw == true
      ? '<span class="badge rounded-pill bg-danger me-2" style="font-size:8px;">NSFW</span>'
      : ""
  }
  <small class="text-muted" id="date" ${
    daysAgo(data.date).indexOf("ago") != -1
      ? 'title="' + new Date(data.date).toLocaleString() + '"'
      : ""
  }>${daysAgo(data.date)}</small>
        <a href="/u?id=${
          data.userId
        }" class="card-subtitle text-muted text-decoration-none d-block" id="username">${
    username.username
  }</a>
  
        ${data.desc}
        
    </div>
    <div class="col-auto">
      <div class="h-100 d-flex align-items-center">
        <button id="playBtn"
        class="btn btn-outline-light bi bi-play fs-2 rounded-circle p-2 d-flex justify-content-center align-items-center m-1"
        onclick="setPlayer(\'${
          data.fileURL
        }\',this)" style="width: 50px; height: 50px;"></button>
      </div>
    </div>
  `;
  cardContainer.innerHTML = card;
  document.getElementById("feedContainer").appendChild(cardContainer);
}
let onPlay, pastOnPlay;
async function image(id) {
  let pathImage = "/staticFiles/defaultProfileImage.png";
  try {
    pathImage = await storage
      .ref("userPhotos/" + id + "/profileImage.jpg")
      .getDownloadURL();
  } catch (error) {}
  return pathImage;
}

function setPlayer(URL, element) {
  if (onPlay) {
    onPlay.classList.remove("bi-pause-fill");
    onPlay.classList.add("bi-play");
  }
  onPlay = element;
  let container = element.parentElement.parentElement.parentElement.children[1];
  let playerContainer = document.getElementById("playerContainer");
  if (!playerContainer.children[0]) {
    playerContainer.innerHTML = PLAYER;
  }
  if (audio?.src === URL) {
    play(player.querySelector("#playBtn"));
  } else {
    player = playerContainer.children[0];
    audio = player.querySelector("audio");
    progress = player.querySelector("#progressBar").children[0];
    volume = player.querySelector("#volumen");
    checkVolume = player.querySelector("#checkVolume");
    audio.src = URL;
    audio.crossOrigin = "anonymous";
    console.log(container, player.children);
    player.children.title.textContent = container.children.title.innerText;
    player.children.date.textContent = container.children.date.innerText;
    player.querySelector("#username").textContent =
      container.children.username.innerText;
    play(player.querySelector("#playBtn"));
  }
  if (!audio.paused) {
    element.classList.remove("bi-play");
    element.classList.add("bi-pause-fill");
  } else {
    element.classList.add("bi-play");
    element.classList.remove("bi-pause-fill");
  }
  //player.date.textContent = new Date(doc.data().date).toLocaleDateString();
  //player.description.textContent = doc.data().desc;
  audio.addEventListener("loadeddata", () => {
    const audioContext = new AudioContext();
    player.querySelector("#playBtn").classList.remove("disabled");
    progress.max = secToPorcentage(audio.duration, audio.duration);
    document.getElementById("duration").textContent = audio.duration
      .toString()
      .toHHMMSS();
    // const track = audioContext.createMediaElementSource(audio);
    // const gainNode = audioContext.createGain();
    // track.connect(gainNode).connect(audioContext.destination);
    volumen.addEventListener("input", (element) => {
      gainNode.gain.value = element.target.value;
    });
    progress.classList.remove("pe-none");
    progress.classList.remove("loadContainer");
  });
  audio.addEventListener("timeupdate", () => {
    //nsole.log(secToPorcentage(audio.currentTime, audio.duration));
    if (secToPorcentage(audio.currentTime, audio.duration)) {
      progress.value = secToPorcentage(audio.currentTime, audio.duration);
    } else {
      progress.value = 0;
    }

    document.getElementById("currentTime").textContent = audio.currentTime
      .toString()
      .toHHMMSS();
  });
  progress.addEventListener("click", (event) => {
    let rect = event.target.getBoundingClientRect();
    let x = event.clientX - rect.left; //x position within the element.
    audio.currentTime =
      porcentageToSecs(
        pixToPorcentage(x, progress.offsetWidth),
        audio.duration
      ) - audio.style.margin;
    //updatePositionState();
  });
  progress.addEventListener("mousemove", (event) => {
    let rect = event.target.getBoundingClientRect();
    let x = event.clientX - rect.left; //x position within the element.
    //let y = event.clientY - rect.top;  //y position within the element.
    let time = (
      porcentageToSecs(
        pixToPorcentage(x, progress.offsetWidth),
        audio.duration
      ) - audio.style.margin
    )
      .toString()
      .toHHMMSS();
    let timerContainer = event.target.parentElement.querySelector("#timer");
    timerContainer.textContent = time;
    timerContainer.style.top =
      (-5 - timerContainer.offsetHeight).toFixed(0) + "px";
    let temp =
      Math.round(x + 0.25) <
      event.target.offsetWidth - timerContainer.offsetWidth
        ? Math.round(x + 0.25) - timerContainer.offsetWidth / 2
        : Math.round(event.target.offsetWidth - timerContainer.offsetWidth);
    // /console.log(temp);
    timerContainer.style.left = temp.toFixed(0) + "px";
  });
  progress.addEventListener("mouseenter", (event) => {
    let timerContainer = event.target.parentElement.querySelector("#timer");
    timerContainer.classList.remove("d-none");
    timerContainer.classList.add("d-block");
  });
  progress.addEventListener("mouseleave", (event) => {
    let timerContainer = event.target.parentElement.querySelector("#timer");
    timerContainer.classList.remove("d-block");
    timerContainer.classList.add("d-none");
  });
}

function play(element) {
  if (audio.paused) {
    audio.play();
    onPlay.classList.remove("bi-play");
    onPlay.classList.add("bi-pause-fill");
    element.classList.remove("bi-play");
    element.classList.add("bi-pause-fill");
  } else {
    onPlay.classList.add("bi-play");
    onPlay.classList.remove("bi-pause-fill");
    element.classList.remove("bi-pause-fill");
    element.classList.add("bi-play");
    audio.pause();
  }
}
function secToPorcentage(time, totalTime) {
  return (time * 100) / totalTime;
}
function porcentageToSecs(porcentage, totalSecs) {
  return (porcentage * totalSecs) / 100;
}
function pixToPorcentage(pixels, totalPixels) {
  return (pixels * 100) / totalPixels;
}
