export default function getUtils(context) {

    const {wapp, req, res} = context;

    return {
        getGlobalState: function () {
            return res.wappResponse.store.getState();
        },
        getRequestUrl: function () {
            const globalState = this.getGlobalState();
            return globalState.req.url;
        },
        getRequestUser: function () {
            const globalState = this.getGlobalState();
            return (globalState.req.user?._id) ? globalState.req.user : null;
        },
        logout: async function (p = {}) {
            const {requestName = "userLogout", redirect = "/"} = p;
            await wapp.requests.send({requestName, req, res});
            if (redirect) {
                wapp.client.history.push(redirect);
            }
        },
        login: async function (p = {}) {
            const {requestName = "userLogin", args, redirect = "/user/:_id"} = p;
            const response = await wapp.requests.send({requestName, args, req, res});
            if (response[requestName]?.record?._id && redirect){
                const pathname = redirect.replace(":_id", response[requestName].record._id)
                wapp.client.history.push(pathname);
            }
        }
    }
}
