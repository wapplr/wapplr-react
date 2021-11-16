export default function getUtils(context) {

    const {wapp, req, res} = context;

    function historyPush({redirect, go, response, requestName, timeOut}) {
        if (response && !response[requestName]?.error && typeof response[requestName]?.record !== "undefined"){

            if (go){
                if (timeOut) {
                    setTimeout(function () {
                        wapp.client.history.go(go);
                    }, timeOut)
                } else {
                    wapp.client.history.go(go);
                }
                return;
            }

            if (redirect) {

                const parsedUrl = {
                    ...(typeof redirect == "object") ? redirect : {},
                    pathname: (typeof redirect == "string") ? redirect : redirect.pathname,
                };

                if (parsedUrl.pathname && response[requestName].record?._id) {
                    parsedUrl.pathname = parsedUrl.pathname.replace(":_id", response[requestName].record._id);
                }

                if (timeOut) {
                    setTimeout(function () {
                        wapp.client.history.push(parsedUrl);
                    }, timeOut)
                } else {
                    wapp.client.history.push(parsedUrl);
                }

            }
        }
    }

    return {
        getGlobalState: function (p) {
            return res.wappResponse.store.getState(p);
        },
        getRequestUrl: function () {
            return this.getGlobalState("req.url");
        },
        getRequestUser: function () {
            const user = this.getGlobalState("req.user");
            return (user?._id) ? user : null;
        },
        logout: async function (p = {}) {
            const {requestName = "userLogout", redirect = "/", go, timeOut} = p;
            const response = await wapp.requests.send({requestName, req, res});
            historyPush({redirect, go, response, requestName, timeOut});
            return response[requestName] || response;
        },
        login: async function (p = {}) {
            const {requestName = "userLogin", args, redirect = "/user/:_id", go, timeOut} = p;
            const response = await wapp.requests.send({requestName, args, req, res});
            historyPush({redirect, go, response, requestName, timeOut});
            return response[requestName] || response;
        },
        signup: async function (p = {}) {
            const {requestName = "userSignup", args, redirect = "/user/:_id", go, timeOut} = p;
            const response = await wapp.requests.send({requestName, args, req, res});
            historyPush({redirect, go, response, requestName, timeOut});
            return response[requestName] || response;
        },
        sendRequest: async function (p = {}) {
            const {requestName = "userForgotPassword", redirect, go, timeOut, ...rest} = p;
            const response = await wapp.requests.send({requestName, req, res, ...rest});
            historyPush({redirect, go, response, requestName, timeOut});
            return (response && response[requestName]) || response;
        },
    }
}
