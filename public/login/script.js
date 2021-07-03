window.addEventListener("load",()=>{
    // Initialize the FirebaseUI Widget using Firebase.
    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    var uiConfig = {
        callbacks: {
          signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            // User successfully signed in.
            // Return type determines whether we continue the redirect automatically
            // or whether we leave that to developer to handle.
            return true;
          },
          uiShown: function() {
            // The widget is rendered.
            // Hide the loader.
            document.getElementById('loader').style.display = 'none';
          }
        },
        // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
        signInFlow: 'popup',
        signInSuccessUrl: '../u',
        signInOptions: [
          // Leave the lines as is for the providers you want to offer your users.
          {
            provider:firebase.auth.EmailAuthProvider.PROVIDER_ID,
            requireDisplayName: false
          },
          {
            provider:firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            scopes:[
              'https://www.googleapis.com/auth/userinfo.email'
            ]
          }
        ],
        // Terms of service url.
        tosUrl: 'tos&pp',
        // Privacy policy url.
        privacyPolicyUrl: 'tos&pp'
    };
    // The start method will wait until the DOM is loaded.
    ui.start('#firebaseui-auth-container', uiConfig);

});