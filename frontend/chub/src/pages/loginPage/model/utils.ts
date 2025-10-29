const API_URL = import.meta.env.VITE_API_URL;

export async function redirectToSocialLogin(socialLoginRequestPath: string) {
  console.log("API URL: ", API_URL);
  window.location.href = API_URL + socialLoginRequestPath;
}
