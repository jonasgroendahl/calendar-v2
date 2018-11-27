import React from 'react';
import "./Flag.css";

/* https://github.com/lipis/flag-icon-css */

export default function Flag(props) {
  let svg;
  switch (props.name) {
    case 'Danish':
      svg = <div className="flag-svg" dangerouslySetInnerHTML={{
        __html: `<svg xmlns="http://www.w3.org/2000/svg" id="flag-icon-css-dk" viewBox="0 0 512 512"><path fill="#c8102e" d="M0 0h512.1v512H0z"/>
      <path fill="#fff" d="M144 0h73.1v512H144z"/>
      <path fill="#fff" d="M0 219.4h512.1v73.2H0z"/>
    </svg>`}} />
      break;
    case 'Finnish':
      svg = <div className="flag-svg" dangerouslySetInnerHTML={{
        __html: `<svg xmlns="http://www.w3.org/2000/svg" id="flag-icon-css-fi" viewBox="0 0 512 512">
        <path fill="#fff" d="M0 0h512v512H0z"/>
        <path fill="#003580" d="M0 186.2h512v139.6H0z"/>
        <path fill="#003580" d="M123.2 0h139.6v512H123.1z"/>
      </svg>`}} />
      break;
    case 'Japanese':
      svg = <div className="flag-svg" dangerouslySetInnerHTML={{
        __html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600">
        <rect fill="#fff" height="600" width="900"/>
        <circle fill="#bc002d" cx="450" cy="300" r="180"/>
        </svg>`}} />
      break;
    case 'German':
      svg = <div className="flag-svg" dangerouslySetInnerHTML={{
        __html: `<svg xmlns="http://www.w3.org/2000/svg" id="flag-icon-css-de" viewBox="0 0 512 512"><path fill="#ffce00" d="M0 341.3h512V512H0z"/>
        <path d="M0 0h512v170.7H0z"/><path fill="#d00" d="M0 170.7h512v170.6H0z"/></svg>` }} />
      break;
    case 'French':
      svg = <div className="flag-svg" dangerouslySetInnerHTML={{
        __html: `<svg xmlns="http://www.w3.org/2000/svg" id="flag-icon-css-fr" viewBox="0 0 512 512"><g fill-rule="evenodd" stroke-width="1pt"><path fill="#fff" d="M0 0h512v512H0z"/>
    <path fill="#00267f" d="M0 0h170.7v512H0z"/><path fill="#f31830" d="M341.3 0H512v512H341.3z"/></g></svg>`}} />;
      break;
    default: /* English */
      svg = <div className="flag-svg" dangerouslySetInnerHTML={{
        __html: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
          id="flag-icon-css-eu" viewBox="0 0 512 512"><defs><g id="d"><g id="b"><path id="a" d="M0-1l-.3 1 .5.1z"/>
          <use transform="scale(-1 1)" xlink:href="#a"/></g><g id="c"><use transform="rotate(72)" xlink:href="#b"/>
          <use transform="rotate(144)" xlink:href="#b"/></g><use transform="scale(-1 1)" xlink:href="#c"/></g></defs>
          <path fill="#039" d="M0 0h512v512H0z"/><g fill="#fc0" transform="translate(256 258.4) scale(25.28395)">
          <use width="100%" height="100%" y="-6" xlink:href="#d"/><use width="100%" height="100%" y="6" xlink:href="#d"/>
          <g id="e"><use width="100%" height="100%" x="-6" xlink:href="#d"/><use width="100%" height="100%" transform="rotate(-144 -2.3 -2.1)" 
          xlink:href="#d"/><use width="100%" height="100%" transform="rotate(144 -2.1 -2.3)" xlink:href="#d"/><use width="100%" height="100%" transform="rotate(72 -4.7 -2)" 
          xlink:href="#d"/><use width="100%" height="100%" transform="rotate(72 -5 .5)" xlink:href="#d"/></g>
          <use width="100%" height="100%" transform="scale(-1 1)" xlink:href="#e"/></g></svg>`}} />
      break;
  }
  return svg;
}
