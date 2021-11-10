/* init particles. https://github.com/drum-n-bass/kinetics */

document.addEventListener("DOMContentLoaded",function(){

  const params = {
    "particles": {
      "count": 16,
      "sides": {"min": 3, "max": 4},
      "sizes": {"min": 2, "max": 5},
      "rotate": {"speed": 1, "direction": null},
      "mode": {
        "type": "space",
        "speed": 11,
        "boundery": "endless"
      },

      "parallex": {
        "layers": 5,
        "speed": 1
      },

      "attract": {
        "chance": 0.3,
        "force": 1,
        "grow": 1.5,
        "size": null,
        "type": "orbit",
        "speed": 3,
        "direction": "random" ,
        "radius": 2
      },

      "fill": { 
        "colors":   ["#6F3FF5","#C9B8FF","#FFCC00"], 
        "toColors": [],
        "opacity": 1
      }
    }
  }

	const kinetics = new Kinetics(params).interactionHook()

})





