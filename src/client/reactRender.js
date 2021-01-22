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
        const {wapp} = this.context;
        if (Component !== this.state.Component) {
            this.setState({
                Component
            })
        } else {
            if (this.refElement && this.refElement.onLocationChange){
                this.refElement.onLocationChange(wapp.response.req.url)
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
            return <Component ref={setRef}/>
        }
        return null;
    }
}
Wapplr.contextType = WappContext;

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
        })

        let lastRenderType = null;

        wapp.styles.use = function (styles) {
            if ((wapp.response.content && wapp.response.content.renderType === "react") ||
                (!wapp.response.content && lastRenderType === "react")
            ) {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                useEffect(function () {
                    return wapp.styles.add(styles)
                })
                lastRenderType = "react"
            } else {
                lastRenderType = null;
                return wapp.styles.add(styles)
            }
        }

        let renderedRef = null;

        middleware.addHandle({
            react: function(req, res, next) {
                const {wapp} = res;

                if (wapp.response.content && wapp.response.content.renderType === "react") {

                    if (typeof res._originalEndFunction === "undefined") {

                        Object.defineProperty(res, "_originalEndFunction", {
                            ...defaultDescriptor,
                            writable: false,
                            enumerable: false,
                            value: res.end
                        });

                    }

                    res.end = function (Component) {
                        if (
                            React.isValidElement(Component) ||
                            (Component && Component.name && Component.name.slice(0,1).toLowerCase() !== Component.name.slice(0,1))
                        ) {
                            if (!wapp.response.sended) {
                                Object.defineProperty(res, "headersSent", {...defaultDescriptor, enumerable: false, writable: false, value: true})
                                const container = wapp.response.container;

                                if (!renderedRef){
                                    ReactDOM.render(
                                        <WappContext.Provider value={{ wapp }}>
                                            <Wapplr ref={function (e){renderedRef = e;}} Component={Component}/>
                                        </WappContext.Provider>,
                                        container
                                    )

                                } else {
                                    renderedRef.renderAgain(Component);
                                }
                            } else {}

                        } else {
                            renderedRef = null;
                            res._originalEndFunction(Component);
                        }
                    }

                    res.wapp.response.status(wapp.response.statusCode || 200);
                    res.wapp.response.send(wapp.response.content.render);

                    next();

                } else {
                    res.end = (res._originalEndFunction) ? res._originalEndFunction : res.end;
                    next();
                }
            }
        })

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
