document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".container");
  document.querySelector(".SignUpLink")?.addEventListener("click", e => {
    e.preventDefault();
    container.classList.add("active");
  });
  document.querySelector(".SignInLink")?.addEventListener("click", e => {
    e.preventDefault();
    container.classList.remove("active");
  });
});

/* FIREBASE CONFIG – USE REAL VALUES */
const firebaseConfig = {
  apiKey: "AIzaSyC-AXGlzlduk4x0VLSR6-kf7v1D1P0zdQc",
  authDomain: "presently-dc0f5.firebaseapp.com",
  projectId: "presently-dc0f5",
  storageBucket: "presently-dc0f5.firebasestorage.app",
  messagingSenderId: "641158943378",
  appId: "1:641158943378:web:1d344c67393dfbe6998c4b",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

const provider = new firebase.auth.GoogleAuthProvider();

async function upsertUserDoc(user) {
  await db.collection("users").doc(user.uid).set({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || "",
    photoURL: user.photoURL || "",
    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
}

function saveUser(user) {
  localStorage.setItem("presently_user", JSON.stringify({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName
  }));
}

/* GOOGLE */
window.gwGoogleLogin = async () => {
  try {
    const res = await auth.signInWithPopup(provider);
    await upsertUserDoc(res.user);
    saveUser(res.user);
    window.location.href = "/app.html";
  } catch (e) {
    alert(e.message);
  }
};

/* EMAIL SIGNUP */
window.gwSignup = async () => {
  try {
    const username = su_username.value.trim();
    const email = su_email.value.trim();
    const password = su_password.value;

    const res = await auth.createUserWithEmailAndPassword(email, password);
    await res.user.updateProfile({ displayName: username });
    await upsertUserDoc(res.user);
    saveUser(res.user);

    window.location.href = "/app.html";
  } catch (e) {
    alert(e.message);
  }
};

/* EMAIL LOGIN */
window.gwLogin = async () => {
  try {
    const email = li_email.value.trim();
    const password = li_password.value;

    const res = await auth.signInWithEmailAndPassword(email, password);
    await upsertUserDoc(res.user);
    saveUser(res.user);

    window.location.href = "/app.html";
  } catch (e) {
    alert(e.message);
  }
};
