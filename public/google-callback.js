// OAuth popup callback for Google sign-in.
// Google redirects the popup here with the OIDC response in the URL fragment.
// Hand the result to the opener window and close. External file (not inline)
// because the site CSP script-src does not allow 'unsafe-inline'.
// MESSAGE_TYPE / RESULT_STORAGE_KEY must match src/components/GoogleAuthButton.tsx.
(function () {
  var params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  var result = {
    type: 'mintcom:google-auth',
    idToken: params.get('id_token') || '',
    state: params.get('state') || '',
    error: params.get('error') || '',
  };

  // Drop the token from the URL/history immediately.
  try {
    window.history.replaceState(null, '', window.location.pathname);
  } catch (e) {
    /* noop */
  }

  try {
    if (window.opener) {
      window.opener.postMessage(result, window.location.origin);
    } else {
      // COOP severed the opener — fall back to a storage event.
      window.localStorage.setItem('mintcom:google-auth-result', JSON.stringify(result));
    }
  } catch (e) {
    /* noop */
  }

  window.close();
})();
