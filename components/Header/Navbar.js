import React from "react"
const Logo = "/images/logo.png"

const Navbar = ({ sticky }) => (
    
    <nav className={sticky ? "navbar navbar-sticky" : "navbar"}>
        <div className="navbar--logo-holder">
            {sticky ?
                <>
                    <img src={Logo} alt="logo" className="navbar--logo" />
                    <a class="navbar-brand" href="/">&nbsp; Skin Hair and You</a>
                </>
                : null}
            <a class="navbar-brand" href="/">&nbsp; Skin Hair and You</a>
        </div>
        <ul className="navbar--link">
            <li className="navbar--link-item">Home</li>
            <li className="navbar--link-item">About</li>
            <li className="navbar--link-item">Blog</li>
        </ul>
    </nav>
)

export default Navbar