// Utility for WebAuthn authentication assertion (login/step-up)
// Usage: await webauthnAuthenticate(email)

const API = process.env.REACT_APP_API_BASE_URL;

// Helper: base64url to Uint8Array
function base64urlToUint8Array(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  const str = atob(base64);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; ++i) bytes[i] = str.charCodeAt(i);
  return bytes;
}
// Helper: ArrayBuffer to base64url
function bufferToBase64url(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function webauthnAuthenticate(email: string): Promise<any> {
  // 1. Get assertion options
  const resp = await fetch(`${API}/api/auth/webauthn/authenticate/options?email=${encodeURIComponent(email)}`, {
    credentials: 'include',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  if (!resp.ok) throw new Error('Failed to get WebAuthn options');
  const options = await resp.json();
  // Convert challenge and allowCredentials[].id
  options.challenge = base64urlToUint8Array(options.challenge);
  if (options.allowCredentials) {
    options.allowCredentials = options.allowCredentials.map((cred: any) => ({
      ...cred,
      id: base64urlToUint8Array(cred.id)
    }));
  }
  // 2. Prompt user
  let assertion;
  try {
    assertion = await navigator.credentials.get({ publicKey: options });
  } catch (e) {
    throw new Error('WebAuthn prompt failed');
  }
  if (!assertion) throw new Error('No assertion');
  const cred = assertion as PublicKeyCredential;
  // 3. Format assertion for backend
  const assertionResp = {
    id: cred.id,
    rawId: bufferToBase64url(cred.rawId),
    response: {
      clientDataJSON: bufferToBase64url((cred.response as AuthenticatorAssertionResponse).clientDataJSON),
      authenticatorData: bufferToBase64url((cred.response as AuthenticatorAssertionResponse).authenticatorData),
      signature: bufferToBase64url((cred.response as AuthenticatorAssertionResponse).signature),
      userHandle: (cred.response as AuthenticatorAssertionResponse).userHandle
        ? bufferToBase64url((cred.response as AuthenticatorAssertionResponse).userHandle!)
        : undefined
    },
    type: cred.type,
    clientExtensionResults: cred.getClientExtensionResults ? cred.getClientExtensionResults() : {}
  };
  // 4. Optionally verify with backend (optional, for login)
  // const verifyResp = await fetch(`${API}/api/auth/webauthn/authenticate/verify`, { ... })
  return assertionResp;
}
