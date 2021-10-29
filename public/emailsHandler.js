let auth;
let db;
let myModal;
// Get the action to complete.
let mode = getParameterByName("mode");
// Get the one-time code from the query parameter.
let actionCode = getParameterByName("oobCode");
// (Optional) Get the continue URL from the query parameter if available.
let continueUrl = getParameterByName("continueUrl");
// (Optional) Get the language code if available.
let lang = getParameterByName("lang") || "en";

window.addEventListener(
  "load",
  () => {
    // Configure the Firebase SDK.
    // This is the minimum configuration required for the API to be used.
    // var config = {
    //   apiKey: "YOU_API_KEY", // Copy this key from the web initialization
    //   // snippet found in the Firebase console.
    // // };
    // var app = firebase.initializeApp(config);
    auth = firebase.auth();
    db = firebase.firestore();
    // user = firebase.auth().currentUser.uid;
    console.log(auth);
    // Handle the user management action.
    let modal = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <form class="m-3" id="reset">
              <h2>New password</h2>
              <div class="form-floating my-3">
                  <input type="password" class="form-control" id="password" placeholder="Password">
                  <label for="floatingPassword">New password</label>
              </div>
              <div class="form-floating my-3">
                <input type="password" class="form-control" id="confirmPassword" placeholder="Password">
                <label for="floatingPassword">Confirm password</label>
              </div>
              <button type="submit" class="btn btn-primary" onclick="getPassword(event)">Reset password</button>
              <div class="invalid-feedback">
                Passwords does not match.
              </div>
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
    switch (mode) {
      case "resetPassword":
        // Display reset password handler and UI.
        //handleResetPassword(auth, actionCode, continueUrl, lang);
        myModal.show();
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

function getPassword(event) {
  event.preventDefault();
  const form = event.target.parentElement; //form\
  console.log(form.password.value, form.confirmPassword.value);
  if (form.password.value != form.confirmPassword.value) {
    console.error("not equals");
    form.password.setCustomValidity("Password must be same");
    form.reportValidity();
  } else {
    newPassword = form.password.value;
    handleResetPassword(auth, actionCode, continueUrl, lang);
  }
}
var newPassword;
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
      //newPassword = "...";

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
          myModal.hide();
          console.log(resp);
          document.getElementById("spinner").remove();
          document.getElementById(
            "message"
          ).textContent = `Password reset complited.`;
          let element = document.createElement("a");
          element.href = "/u";
          element.textContent = "Profile";
          document.getElementById("message").appendChild(element);
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
