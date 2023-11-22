import React from "react";
import ReactDOMServer from "react-dom/server";
import Html from "./Html";
import Log from "../common/Log";
import {defaultDescriptor} from "../common/utils";
import {WappContext, withWapp} from "../common/Wapp";

export default function reactRender(p = {}) {

    const {wapp} = p;
    const middleware = wapp.server.middlewares.render;

    if (!middleware._initializedWapplrReact) {

        wapp.contents.addComponent({
            html: Html
        });

        wapp.contents.add({
            log: {
                render: Log,
                renderType: "react"
            },
        });

        middleware.addHandle({
            react: function(req, res, next) {
                if (res.wappResponse.content && res.wappResponse.content.renderType === "react") {

                    res.wappResponse.status(res.wappResponse.statusCode || 200);

                    const Content = res.wappResponse.content.render;
                    const RenderContent = withWapp(Content);

                    if (res.wapplrReactEndType === "component"){

                        function Render() {
                            return (
                                <WappContext.Provider value={{ wapp, req, res }}>
                                    <RenderContent />
                                </WappContext.Provider>
                            )
                        }

                        res.wappResponse.send({Render, wapp, req, res});

                        return;
                    }

                    const RenderHtml = wapp.contents.getComponent("html") || Html;

                    if (ReactDOMServer.renderToPipeableStream && (res.wapplrReactEndType === 'pipe' || res.wapplrReactEndType === 'pipeWaitForAll')) {

                        function Pipe() {

                            function Children() {
                                return (
                                    <WappContext.Provider value={{wapp, req, res}}>
                                        <RenderContent/>
                                    </WappContext.Provider>
                                )
                            }

                            const children = <Children/>;

                            return (
                                <WappContext.Provider value={{wapp, req, res}}>
                                    <RenderHtml>
                                        {children}
                                    </RenderHtml>
                                </WappContext.Provider>
                            )

                        }

                        let didError = false;

                        const {pipe} = ReactDOMServer.renderToPipeableStream(<Pipe/>, {
                            onShellReady() {
                                if (res.wapplrReactEndType === 'pipe') {
                                    if (!res.headersSent) {
                                        res.wappResponse.sendData = {
                                            dontSetContentLength: true
                                        };

                                        if (didError) {
                                            res.wappResponse.status(didError.statusCode || 500, didError);
                                        }

                                        res.wapp.middleware.runSendMiddlewares(req, res, function next() {
                                            res.wapp.log(req, res);
                                            pipe(res)
                                        });
                                    }
                                }
                            },
                            onShellError(err) {
                                res.wappResponse.status(err.statusCode || 500, err);
                                res.wapp.log(err, req, res);
                                next(err)
                            },
                            onAllReady: ()=>{
                                if (res.wapplrReactEndType === 'pipeWaitForAll') {
                                    if (!res.headersSent) {
                                        res.wappResponse.sendData = {
                                            dontSetContentLength: true
                                        };
                                        if (didError) {
                                            res.wappResponse.status(didError.statusCode || 500, didError);
                                        }
                                        res.wapp.middleware.runSendMiddlewares(req, res, function next() {
                                            res.wapp.log(req, res);
                                            pipe(res)
                                        });
                                    }
                                }
                                res.end()
                            },
                            onError: (err)=>{
                                didError = err;
                            }
                        });

                        return;

                    }

                    const contentText = ReactDOMServer.renderToStaticMarkup(
                        <WappContext.Provider value={{ wapp, req, res }}>
                            <RenderContent />
                        </WappContext.Provider>
                    );

                    res.wappResponse.send("<!DOCTYPE html>" +
                        ReactDOMServer.renderToStaticMarkup(
                            <WappContext.Provider value={{ wapp, req, res }}>
                                <RenderHtml contentText={contentText}/>
                            </WappContext.Provider>
                        )
                    );

                    next();

                } else {
                    next();
                }
            },
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
