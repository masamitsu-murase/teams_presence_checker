
(async function () {
    const sleep = function (msecond) {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(), msecond);
        });
    };

    try {
        await browser.runtime.sendMessage({
            "type": "initializeToken",
            "args": {
                "url": location.href
            }
        });
        console.log("Login");
        document.body.innerHTML = "<h1>Login succeeded. </h1><p style='font-size: larger;'>This page will be closed in 5 seconds...</p>"
        await sleep(5000);
        browser.runtime.sendMessage({ "type": "closeThisTab", "args": [] });
    } catch (err) {
        console.error(err);
    }
})();
