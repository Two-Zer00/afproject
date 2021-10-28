//var auth;
let db;
let myModal;
window.addEventListener(
  "load",
  () => {
    // TODO: Implement getParameterByName()

    // Get the action to complete.
    var mode = getParameterByName("mode");
    // Get the one-time code from the query parameter.
    var actionCode = getParameterByName("oobCode");
    // (Optional) Get the continue URL from the query parameter if available.
    var continueUrl = getParameterByName("continueUrl");
    // (Optional) Get the language code if available.
    var lang = getParameterByName("lang") || "en";

    // Configure the Firebase SDK.
    // This is the minimum configuration required for the API to be used.
    // var config = {
    //   apiKey: "YOU_API_KEY", // Copy this key from the web initialization
    //   // snippet found in the Firebase console.
    // // };
    // var app = firebase.initializeApp(config);
    let auth = firebase.auth();
    db = firebase.firestore();
    // user = firebase.auth().currentUser.uid;
    console.log(auth);
    // Handle the user management action.
    let modal = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <form class="m-3" id="reset">
              <h2 class="">New password</h2>
              <div class="form-floating my-3">
                  <input type="password" class="form-control" id="password" placeholder="Password">
                  <label for="floatingPassword">New password</label>
              </div>
              <div class="form-floating my-3">
                <input type="password" class="form-control" id="floatingPassword" placeholder="Password">
                <label for="floatingPassword">Confirm password</label>
              </div>
              <button type="submit" class="btn btn-primary">Reset password</button>
            </form>
          </div>
        </div>
      `;
    let modalContainer = document.createElement("div");
    modalContainer.classList.add("modal", "fade");
    modalContainer.id = "passwordModalContainer";
    modalContainer.tabIndex = -1;
    modalContainer.setAttribute(
      "aria-labelledby",
      "passwordModalContainerLabel"
    );
    modalContainer.setAttribute("aria-hidden", "true");
    modalContainer.innerHTML = modal;
    myModal = new bootstrap.Modal(modalContainer, {});
    document.getElementById("reset");
    myModal.show();
    switch (mode) {
      case "resetPassword":
        // Display reset password handler and UI.
        //handleResetPassword(auth, actionCode, continueUrl, lang);
        break;
      case "recoverEmail":
        // Display email recovery handler and UI.
        handleRecoverEmail(auth, actionCode, lang);
        break;
      case "verifyEmail":
        // Display email verification handler and UI.
        document.getElementById(
          "message"
        ).textContent = `Verifying your email adress.`;
        handleVerifyEmail(auth, actionCode, continueUrl, lang);
        break;
      default:
      // Error: invalid mode.
    }
  },
  false
);

function getParameterByName(name) {
  let searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(name);
}

function checkUser() {
  return auth.currentUser;
}

function handleResetPassword(auth, actionCode, continueUrl, lang) {
  // Localize the UI to the selected language as determined by the lang
  // parameter.

  // Verify the password reset code is valid.
  auth
    .verifyPasswordResetCode(actionCode)
    .then((email) => {
      var accountEmail = email;

      // TODO: Show the reset screen with the user's email and ask the user for
      // the new password.
      var newPassword = "...";

      // Save the new password.
      auth
        .confirmPasswordReset(actionCode, newPassword)
        .then((resp) => {
          // Password reset has been confirmed and new password updated.
          // TODO: Display a link back to the app, or sign-in the user directly
          // if the page belongs to the same domain as the app:
          // auth.signInWithEmailAndPassword(accountEmail, newPassword);
          // TODO: If a continue URL is available, display a button which on
          // click redirects the user back to the app via continueUrl with
          // additional state determined from that URL's parameters.
        })
        .catch((error) => {
          // Error occurred during confirmation. The code might have expired or the
          // password is too weak.
        });
    })
    .catch((error) => {
      // Invalid or expired action code. Ask user to try to reset the password
      // again.
    });
}

function handleVerifyEmail(auth, actionCode, continueUrl, lang) {
  // Localize the UI to the selected language as determined by the lang
  // parameter.
  // Try to apply the email verification code.
  //let authA = await firebase.auth().currentUser;
  //console.log(JSON.stringify(authA));
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      var uid = user.uid;
      console.log(uid);
      auth
        .applyActionCode(actionCode)
        .then((resp) => {
          // Email address has been verified.
          // TODO: Display a confirmation message to the user.
          // You could also provide the user with a link back to the app.
          // TODO: If a continue URL is available, display a button which on
          // click redirects the user back to the app via continueUrl with
          // additional state determined from that URL's parameters.
          console.log(resp);
          document.getElementById("spinner").remove();
          document.getElementById(
            "message"
          ).textContent = `Email verification run succesfully.`;
          let element = document.createElement("a");
          element.href = "/u";
          element.textContent = "Profile";
          document.getElementById("message").appendChild(element);
          db.collection("user")
            .doc(uid)
            .update({ emailVerify: true })
            .then(() => {
              console.log("everything work fine");
            })
            .catch((error) => {
              console.error("Error writing document: ", error);
            });
        })
        .catch((error) => {
          document.getElementById("spinner").remove();
          document.getElementById(
            "message"
          ).textContent = `${error.message}, please try again.`;
          let element = document.createElement("a");
          element.href = "/u";
          element.textContent = "Profile";
          document.getElementById("message").appendChild(element);
        });
    } else {
      document.getElementById("spinner").remove();
      document.getElementById(
        "message"
      ).textContent = `Not logged, please try again.`;
      let element = document.createElement("a");
      element.href = "/u";
      element.textContent = "Profile";
      document.getElementById("message").appendChild(element);
    }
  });
  // db.collection("user")
  //   .doc(auth.currentUser.uid)
  //   .update({ emailVerify: true })
  //   .then(() => {
  //     console.log("everything work fine");
  //   })
  //   .catch((error) => {
  //     console.error("Error writing document: ", error);
  //   });

  //console.log(auth.currentUser.uid);
}
