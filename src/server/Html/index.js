import React, {useContext} from "react";
import style from "wapplr/dist/common/template/app_css.js";

import {WappContext} from "../../common/Wapp";

export default function Html(props) {

    const {wapp, req, res} = useContext(WappContext);

    const {contentText = "", appStyle = style} = props;

    const config = wapp.server.config;

    const {
        siteName = "Wapplr",
        assets = {},
        lang = "en_US",
        viewport="width=device-width, initial-scale=1",
        themeColor="#ffffff",
        manifest="/manifest.json",
        icon="data:image/png;base64,iVBORw0KGgo=",
        appleTouchIcon,
    } = config;

    const {state, content = {}, statusCode = 200, containerElementId = "app", appStateName = "APP_STATE"} = res.wappResponse;

    let {title = "", description = "", author = "Wapplr"} = content;

    if (typeof title === "function") {title = title({wapp, req, res});}
    title = `${(title) ? title : (statusCode === 404) ? "Not Found | " + siteName : "Untitled Page | " + siteName }`;

    if (typeof description === "function") {description = description({wapp, req, res})}
    description = (description) ? description : (title && title.split) ? title.split(" | ")[0] : title;

    if (typeof author === "function") {author = author({wapp, req, res})}
    author = (author || siteName);

    const scripts = assets.getScripts();

    const stateText = `window["${appStateName}"] = ${JSON.stringify(state)}`;

    wapp.styles.use(appStyle);

    const styles = wapp.styles.getCssText();

    const ExtendedHeadComponent = wapp.contents.getComponent("head");

    return (
        <html lang={lang.split("_")[0]}>
            <head>
                <meta charSet="utf-8" />
                <title>{title}</title>
                <meta name={"description"} content={description} />
                <meta name={"author"} content={author} />
                <meta name={"viewport"} content={viewport} />
                <meta name={"theme-color"} content={themeColor} />
                <link rel={"manifest"} href={manifest} />
                <link rel={"icon"} href={icon} />
                <link rel={"apple-touch-icon"} href={appleTouchIcon || icon} />
                {(styles && styles.length) ? styles.map(function(style) {return <style key={style.id} id={style.id} dangerouslySetInnerHTML={{__html: style.cssText}}/>}) : null}
                {(ExtendedHeadComponent) ? <ExtendedHeadComponent /> : null}
            </head>
            <body>
                <div className={appStyle.app} id={containerElementId} dangerouslySetInnerHTML={{__html: contentText}} />
                {(stateText) ? <script dangerouslySetInnerHTML={{ __html: stateText }}/> : null}
                {(scripts && scripts.length) ? scripts.map(function(script) { return <script key={script} src={script} />}) : null}
            </body>
        </html>
    )
}
