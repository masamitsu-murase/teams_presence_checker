
(function () {
    browser.runtime.sendMessage({
        "type": "login",
        "args": {
            "url": location.href
        }
    }).then(() => {
        console.log("Login");
    }).catch(err => {
        console.error(err);
    });
})();
