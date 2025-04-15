import React, { Component } from "react";
import { Fade } from "react-reveal";
import "./Error.css";
import { Link } from "react-router-dom";

export default class Error extends Component {
  render() {
    const theme = this.props.theme;
    return (
      <div className="error-main">
        <div className="error-class">
          <Fade bottom duration={2000} distance="40px">
            <h1>Woops</h1>
            <h1 className="error-404">404</h1>
            <p>The requested page is unavailable at the moment!</p>
            <Link
              className="main-button"
              to="/"
              style={{
                color: "#00000",
                backgroundColor: "#00000",
                border: `solid 1px ${theme === "dark" ? "#ffffff" : "#000000"}`,
                display: "inline-flex",
              }}
            >
              Go Home
            </Link>
          </Fade>
        </div>
      </div>
    );
  }
}
