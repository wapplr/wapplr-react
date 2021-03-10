import wapplrClient from "wapplr";
import reactRender from "./reactRender";

export default function createClient(p) {
    const wapp = p.wapp || wapplrClient({...p});
    return reactRender({wapp, ...p});
}

export function createMiddleware(p = {}) {
    return function reactMiddleware(req, res, next) {
        const wapp = req.wapp || p.wapp || createClient(p).wapp;
        reactRender({wapp, ...p});
        next();
    }
}

const defaultConfig = {
    config: {
        globals: {
            DEV: (typeof DEV !== "undefined") ? DEV : undefined,
            WAPP: (typeof WAPP !== "undefined") ? WAPP : undefined,
            RUN: (typeof RUN !== "undefined") ? RUN : undefined,
            TYPE: (typeof TYPE !== "undefined") ? TYPE : undefined,
            ROOT: (typeof ROOT !== "undefined") ? ROOT : "/"
        }
    }
};

export function run(p = defaultConfig) {

    const wapp = createClient(p).wapp;
    const globals = wapp.globals;
    const {DEV} = globals;

    const app = wapp.client.app;
    app.use(createMiddleware({wapp, ...p}));
    wapp.client.listen();

    if (typeof DEV !== "undefined" && DEV && module.hot){
        app.hot = module.hot;
        module.hot.accept();
    }

    return wapp;
}

if (typeof RUN !== "undefined" && RUN === "wapplr-react") {
    run();
}
