import React, {useContext, useEffect, useState} from "react";
import style from "wapplr/dist/common/template/template_css.js";

import getUtils from "../Wapp/getUtils";
import {WappContext} from "../Wapp";
import WapplrLogo from "../Logo";

export default function Template(props) {

    const context = useContext(WappContext);
    const {wapp} = context;
    const utils = getUtils(context);

    const {
        children,
        footerMenu = [
            {name: "HOME", href:"/"},
            {name: "404", href:"/404"},
            {name: "500", href:"/500"},
            {name: "EXTERNAL", href:"https://google.com", target:"_blank"}
        ],
        Logo = WapplrLogo,
        subscribe
    } = props;

    const {styles} = wapp;
    const {siteName = "Wapplr"} = wapp.config;
    const copyright = `${siteName} ${new Date().getFullYear()} ©`;

    styles.use(style);

    const [url, setUrl] = useState(utils.getRequestUrl());

    function onLocationChange(newUrl){
        if (url !== newUrl){
            setUrl(newUrl);
        }
    }

    function onScroll(e) {
        const header = document.querySelector("." + style.header);
        header.classList.toggle(style.sticky, window.scrollY > 0 )
    }

    useEffect(function didMount(){
        window.addEventListener("scroll", onScroll);
        const unsub = (subscribe) ? subscribe.locationChange(onLocationChange) : null;
        return function willUnmount() {
            window.removeEventListener("scroll", onScroll);
            if (unsub) {
                unsub();
            }
        }
    }, [url])

    return (
        <div className={style.page}>
            <header className={style.header}>
                <div className={style.innerHeader}>
                    <div className={style.logo}>
                        {(Logo) ? <Logo /> : null}
                    </div>
                </div>
            </header>
            <main className={style.content}>{children}</main>
            <footer className={style.footer}>
                <div>
                    <div className={style.menu}>
                        {[...footerMenu.map(function (menu, key) {

                            const target = menu.target || "self";
                            const noReferrer = (target === "_blank") ? "noreferrer" : null;
                            const href = menu.href;

                            return (
                                <div key={key}>
                                    <a className={style.button}
                                       target={target}
                                       href={href}
                                       rel={noReferrer}
                                       onClick={function (e) {
                                           const inner = !(target === "_blank" || (href && href.slice(0,7) === "http://") || (href && href.slice(0,8) === "https://"));

                                           if (inner){

                                               wapp.client.history.push({
                                                   search:"",
                                                   href:"",
                                                   ...wapp.client.history.parsePath(href)
                                               });

                                               e.preventDefault();

                                           }
                                       }}
                                    >
                                        {menu.name}
                                    </a>
                                </div>
                            )

                        })]}
                    </div>
                    <div className={style.copyright}>
                        {copyright}
                    </div>
                </div>
            </footer>
        </div>
    )
}
