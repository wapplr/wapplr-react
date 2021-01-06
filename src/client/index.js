import wapplrClient from "wapplr";
import reactRender from "./reactRender";

export default function createClient(p) {
    const wapp = p.wapp || wapplrClient({...p});
    reactRender({wapp, ...p});
    return wapp;
}

export function createMiddleware(p = {}) {
    return function reactMiddleware(req, res, next) {
        const wapp = req.wapp || p.wapp || createClient;
        reactRender({wapp, ...p});
        next();
    }
}

export function run(p = {}) {

    const wapp = createClient(p);
    const globals = wapp.globals;
    const {DEV} = globals;

    const app = wapp.client.app;

    app.use(createMiddleware({wapp, ...p}))
    wapp.client.listen();

    if (typeof DEV !== "undefined" && DEV && module.hot){
        module.hot.accept();
    }

    return wapp;
}

if (typeof RUN !== "undefined" && RUN === "wapplr-react") {
    run();
}
