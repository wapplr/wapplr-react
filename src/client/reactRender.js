import React, {useEffect} from "react";
import ReactDOM from "react-dom";

import Log from "../common/Log";
import {defaultDescriptor} from "../common/utils";
import {withWapp, WappContext} from "../common/Wapp";

class Wapplr extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.setRef = this.setRef.bind(this);
        this.refElement = null;
        this.state = {
            Component: props.Component
        }
    }
    setRef(e) {
        this.refElement = e;
    }
    renderAgain(Component) {
        const {res} = this.context;
        if (Component !== this.state.Component) {
            this.setState({
                Component
            })
        } else {
            if (this.refElement && this.refElement.onLocationChange){
                this.refElement.onLocationChange(res.wappResponse.store.getState().req.url)
            }
        }
    }
    componentWillUnmount() {
        this.refElement = null;
    }
    render() {
        const Component = (this.state.Component) ? withWapp(this.state.Component) : null;
        if (Component) {
            const setRef = this.setRef;
            return <Component wappRef={setRef}/>
        }
        return null;
    }
}
Wapplr.contextType = WappContext;

let renderedRef = null;

export default function reactRender(p = {}) {

    const {wapp} = p;
    const middleware = wapp.client.middlewares.render;

    if (!middleware._initializedWapplrReact) {

        const config = wapp.client.config;
        if (!config.styles){
            config.styles = {};
        }
        if (typeof config.styles.disableClearStyles == "undefined"){
            config.styles.disableClearStyles = true;
        }

        wapp.contents.add({
            log: {
                render: Log,
                renderType: "react"
            }
        });

        let lastRenderType = null;
        let mutableContext = {
            wapp,
            req: null,
            res: null
        };

        wapp.styles.use = function (styles) {
            if ((mutableContext.res.wappResponse.content &&
                mutableContext.res.wappResponse.content.renderType === "react") ||
                (!mutableContext.res.wappResponse.content && lastRenderType === "react")
            ) {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                useEffect(function () {
                    return wapp.styles.add(styles)
                });
                lastRenderType = "react"
            } else {
                lastRenderType = null;
                return wapp.styles.add(styles)
            }
        };

        middleware.addHandle({
            react: function(req, res, next) {

                mutableContext.req = req;
                mutableContext.res = res;

                if (res.wappResponse.content && res.wappResponse.content.renderType === "react") {

                    if (typeof res._originalEndFunction === "undefined") {

                        Object.defineProperty(res, "_originalEndFunction", {
                            ...defaultDescriptor,
                            writable: false,
                            enumerable: false,
                            value: res.end
                        });

                    }

                    res.end = function (Component) {
                        if (!res.wappResponse.sended) {
                            Object.defineProperty(res, "headersSent", {...defaultDescriptor, enumerable: false, writable: false, value: true});

                            const container = res.wappResponse.container;

                            if (!renderedRef){
                                ReactDOM.hydrate(
                                    <WappContext.Provider value={mutableContext}>
                                        <Wapplr ref={function (e){renderedRef = e;}} Component={Component}/>
                                    </WappContext.Provider>,
                                    container
                                )

                            } else {
                                renderedRef.renderAgain(Component);
                            }

                        }
                    };

                    res.wappResponse.status(res.wappResponse.statusCode || 200);
                    res.wappResponse.send(res.wappResponse.content.render);

                    next();

                } else {
                    renderedRef = null;
                    res.end = (res._originalEndFunction) ? res._originalEndFunction : res.end;
                    next();
                }
            }
        });

        Object.defineProperty(middleware, "_initializedWapplrReact", {
            ...defaultDescriptor,
            writable: false,
            enumerable: false,
            value: true
        });

        Object.defineProperty(middleware, "wapp", {...defaultDescriptor, writable: false, enumerable: false, value: wapp});

    }

    return middleware;

}
