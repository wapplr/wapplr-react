import wapplrServer from "wapplr";
import reactRender from "./reactRender";

export default function createServer(p = {}) {
    const wapp = p.wapp || wapplrServer({...p});
    return reactRender({wapp, ...p});
}

export function createMiddleware(p = {}) {
    return function reactMiddleware(req, res, next) {
        const wapp = req.wapp || p.wapp || createServer(p).wapp;
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
            ROOT: (typeof ROOT !== "undefined") ? ROOT : __dirname,
            NAME: (typeof NAME !== "undefined") ? NAME : undefined,
        }
    }
};

export function run(p = defaultConfig) {

    if (p?.config?.globals && !p.config.globals.RUN){
        p.config.globals.RUN = p.config?.globals.NAME || "wapplr-react"
    }

    const {env} = process;
    env.NODE_ENV = process.env.NODE_ENV;

    const wapp = createServer(p).wapp;
    const globals = wapp.globals;
    const {DEV} = globals;

    const app = wapp.server.app;
    app.use(createMiddleware({wapp, ...p}));
    wapp.server.listen();

    if (typeof DEV !== "undefined" && DEV && module.hot){
        app.hot = module.hot;
        module.hot.accept("./index");
    }

    return wapp;
}

if (typeof RUN !== "undefined" && RUN === "wapplr-react") {
    run();
}
