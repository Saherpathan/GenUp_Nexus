import React from 'react';
import gsap from 'gsap';
import './background.css';

const Background = () => {
  document.body.addEventListener("mousemove", evt => {
		const mouseX = evt.clientX;
		const mouseY = evt.clientY;
	  
		gsap.set(".cursor", {
		  x: mouseX,
		  y: mouseY });
	  
	  
		gsap.to(".shape", {
		  x: mouseX,
		  y: mouseY,
		  stagger: -0.1 });
	  
	});
  
  return (
    <div className="content">
        <div className="cursor"></div>
        <div className="shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
        </div>
    </div>
  )
}

export default Background;