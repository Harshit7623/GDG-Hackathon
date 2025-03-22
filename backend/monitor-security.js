const { admin } = require("./firebase-config");
const functions = require("firebase-functions");

exports.monitorLoginAttempts = functions.auth.user().onCreate((user) => {
    const failedAttempts = user.metadata.failedLoginAttempts;
    if (failedAttempts > 3) {
        admin.auth().updateUser(user.uid, { disabled: true });
        console.log("Suspicious user blocked");
    }
});
