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
    var auth = firebase.auth();

    // Handle the user management action.
    switch (mode) {
      case "resetPassword":
        // Display reset password handler and UI.
        handleResetPassword(auth, actionCode, continueUrl, lang);
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

function handleVerifyEmail(auth, actionCode, continueUrl, lang) {
  // Localize the UI to the selected language as determined by the lang
  // parameter.
  // Try to apply the email verification code.
  if (checkUser()) {
    auth
      .applyActionCode(actionCode)
      .then((resp) => {
        // Email address has been verified.
        // TODO: Display a confirmation message to the user.
        // You could also provide the user with a link back to the app.
        // TODO: If a continue URL is available, display a button which on
        // click redirects the user back to the app via continueUrl with
        // additional state determined from that URL's parameters.
        document.getElementById("spinner").remove();
        document.getElementById(
          "message"
        ).textContent = `Email verification run succesfully.`;
        let element = document.createElement("a");
        element.href = "/u";
        element.textContent = "Profile";
        document.getElementById("message").appendChild(element);
        let db = firebase.database();
        db.collection("user")
          .doc(auth.currentUser.uid)
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
        ).textContent = `Email verification have errors, please try again.`;
        let element = document.createElement("a");
        element.href = "/u";
        element.textContent = "Profile";
        document.getElementById("message").appendChild(element);
      });
  }
}
