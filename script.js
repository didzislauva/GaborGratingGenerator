 // DOM elements for controls
    const orientationSlider = document.getElementById("orientation");
    const periodsSlider = document.getElementById("periods");
    const sizeSlider = document.getElementById("size");
    const phaseSlider = document.getElementById("phase");
    const phaseValue = document.getElementById("phaseValue");
    const sigmaSlider = document.getElementById("sigma");
    const sigmaValue = document.getElementById("sigmaValue");
    
    // Envelope options
    const envelopeOptions = document.querySelectorAll('.envelope-option');
    let currentEnvelope = "gaussian";

    // Color controls
    const color1R = document.getElementById("color1R");
    const color1G = document.getElementById("color1G");
    const color1B = document.getElementById("color1B");
    const color2R = document.getElementById("color2R");
    const color2G = document.getElementById("color2G");
    const color2B = document.getElementById("color2B");
    const color1Preview = document.getElementById("color1Preview");
    const color2Preview = document.getElementById("color2Preview");

    // Download button
    const downloadBtn = document.getElementById("downloadBtn");

    // Canvas and display elements
    const canvas = document.getElementById("gaborCanvas");
    const ctx = canvas.getContext("2d");
    const orientationValue = document.getElementById("orientationValue");
    const periodsValue = document.getElementById("periodsValue");
    const sizeValue = document.getElementById("sizeValue");

    // Update color previews
    function updateColorPreviews() {
      color1Preview.style.backgroundColor = `rgb(${color1R.value}, ${color1G.value}, ${color1B.value})`;
      color2Preview.style.backgroundColor = `rgb(${color2R.value}, ${color2G.value}, ${color2B.value})`;
    }

    // Calculate envelope value based on selected type
    function calculateEnvelope(dx, dy, sigma, size) {
      // Calculate distance from center (normalized)
      const radius = Math.sqrt(dx * dx + dy * dy);
      const normalizedRadius = radius / (size / 2);

      switch (currentEnvelope) {
        case "gaussian":
          return Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
        
        case "linear":
          return Math.max(0, 1 - normalizedRadius / sigma);
        
        case "cosine": {
		  const normSigma = sigma / (size / 2);
		  if (normalizedRadius > normSigma) return 0;
		  return Math.cos((Math.PI * normalizedRadius) / (2 * normSigma));
		}

		case "hann": {
		  const normSigma = sigma / (size / 2);
		  if (normalizedRadius > normSigma) return 0;
		  return 0.5 * (1 + Math.cos(Math.PI * normalizedRadius / normSigma));
		}

		case "hamming": {
		  const normSigma = sigma / (size / 2);
		  if (normalizedRadius > normSigma) return 0;
		  return 0.54 + 0.46 * Math.cos(Math.PI * normalizedRadius / normSigma);
		}
        
        case "circular":
          return normalizedRadius <= sigma ? 1 : 0;
        
        case "rectangular":
          const normX = Math.abs(dx) / (size / 2);
          const normY = Math.abs(dy) / (size / 2);
          return (normX <= sigma && normY <= sigma) ? 1 : 0;
        
        case "none":
          return 1;
        
        default:
          return 1;
      }
    }

    // Draw the Gabor grating
    function drawGaborGrating(size = 200, targetCtx = ctx) {
	  size = parseInt(size);
	  const angleDeg = parseFloat(orientationSlider.value);
	  const angleRad = angleDeg * Math.PI / 180;
	  const periods = parseInt(periodsSlider.value);
	  const frequency = periods / size;
	  const phaseDeg = parseFloat(phaseSlider.value);
	  const phaseRad = phaseDeg * Math.PI / 180;

	  const c1r = parseInt(color1R.value);
	  const c1g = parseInt(color1G.value);
	  const c1b = parseInt(color1B.value);
	  const c2r = parseInt(color2R.value);
	  const c2g = parseInt(color2G.value);
	  const c2b = parseInt(color2B.value);

	  const centerX = size / 2;
	  const centerY = size / 2;

	  const sigmaScale = parseFloat(sigmaSlider.value);
	  let sigma;
	  if (["circular", "rectangular", "linear"].includes(currentEnvelope)) {
		sigma = Math.max(0.01, sigmaScale);
	  } else {
		sigma = (size / 6) * sigmaScale;
	  }

	  // Update info labels only if preview mode
	  if (size === 200) {
		orientationValue.textContent = `${angleDeg}° (${angleRad.toFixed(2)} rad)`;
		periodsValue.textContent = `${periods} (freq: ${frequency.toFixed(4)} cyc/px)`;
		sizeValue.textContent = `${parseInt(sizeSlider.value)} px`; // still show download size
		phaseValue.textContent = `${phaseDeg}° (${phaseRad.toFixed(2)} rad)`;
		sigmaValue.textContent = `σ = ${sigma.toFixed(1)} px`;
	  }

	  const imageData = targetCtx.createImageData(size, size);
	  const data = imageData.data;

	  for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
		  const dx = x - centerX;
		  const dy = y - centerY;
		  const xTheta = dx * Math.cos(angleRad) + dy * Math.sin(angleRad);
		  const envelope = calculateEnvelope(dx, dy, sigma, size);
		  const sinusoid = Math.cos(2 * Math.PI * frequency * xTheta + phaseRad);
		  const gabor = envelope * sinusoid;
		  const colorMix = (gabor + 1) / 2;
		  const r = Math.round(c2r + colorMix * (c1r - c2r));
		  const g = Math.round(c2g + colorMix * (c1g - c2g));
		  const b = Math.round(c2b + colorMix * (c1b - c2b));
		  const index = (y * size + x) * 4;
		  data[index] = r;
		  data[index + 1] = g;
		  data[index + 2] = b;
		  data[index + 3] = 255;
		}
	  }

	  targetCtx.putImageData(imageData, 0, 0);
	  updateColorPreviews();
	}


    // Handle envelope option selection
    envelopeOptions.forEach(option => {
      option.addEventListener('click', function() {
        // Remove active class from all options
        envelopeOptions.forEach(opt => opt.classList.remove('active'));
        
        // Add active class to selected option
        this.classList.add('active');
        
        // Update current envelope
        currentEnvelope = this.dataset.envelope;
        
        // Redraw grating
        drawGaborGrating();
      });
    });

    // Download functionality
    downloadBtn.addEventListener("click", function () {
	  const sizeInput = document.getElementById("sizeInput");
	  const downloadSize = parseInt(sizeInput.value); // ✅ use the input, not the slider

	  // Create a temporary offscreen canvas
	  const tmpCanvas = document.createElement("canvas");
	  tmpCanvas.width = tmpCanvas.height = downloadSize;
	  const tmpCtx = tmpCanvas.getContext("2d");

	  // Draw high-res image into it
	  drawGaborGrating(downloadSize, tmpCtx);

	  // Save
	  const orientation = parseInt(orientationSlider.value);
	  const phase = parseInt(phaseSlider.value);
	  const periods = parseInt(periodsSlider.value);
	  const filename = `gabor_${currentEnvelope}_ori${orientation}_ph${phase}_per${periods}_sz${downloadSize}.png`;

	  const link = document.createElement("a");
	  link.download = filename;
	  link.href = tmpCanvas.toDataURL("image/png");
	  document.body.appendChild(link);
	  link.click();
	  document.body.removeChild(link);
	});

    // Add event listeners to controls
		orientationSlider.addEventListener("input", () => drawGaborGrating());
		periodsSlider.addEventListener("input", () => drawGaborGrating());
		sizeSlider.addEventListener("input", () => drawGaborGrating());
		phaseSlider.addEventListener("input", () => drawGaborGrating());
		sigmaSlider.addEventListener("input", () => drawGaborGrating());

		color1R.addEventListener("input", () => drawGaborGrating());
		color1G.addEventListener("input", () => drawGaborGrating());
		color1B.addEventListener("input", () => drawGaborGrating());
		color2R.addEventListener("input", () => drawGaborGrating());
		color2G.addEventListener("input", () => drawGaborGrating());
		color2B.addEventListener("input", () => drawGaborGrating());


    // Initial draw on page load
    window.addEventListener("load", function() {
      updateColorPreviews();
      drawGaborGrating();
    });
	
	
function bindSliderAndInputs(sliderId) {
  const slider = document.getElementById(sliderId);
  const valueInput = document.getElementById(sliderId + "Input");
  const minInput = document.getElementById(sliderId + "Min");
  const maxInput = document.getElementById(sliderId + "Max");
  const stepInput = document.getElementById(sliderId + "Step");
  
  slider.addEventListener("input", () => {
	  valueInput.value = slider.value;
	  drawGaborGrating();
	  updatePeriodsLabel();
	});

  // Sync value input → slider
  valueInput.addEventListener("input", () => {
    const value = parseFloat(valueInput.value);

    // If value exceeds current max, extend max
    if (value > parseFloat(slider.max)) {
      slider.max = value;
      if (maxInput) maxInput.value = value;
    }

    // If value is below current min, lower min
    if (value < parseFloat(slider.min)) {
      slider.min = value;
      if (minInput) minInput.value = value;
    }

    slider.value = value;
    drawGaborGrating();
  });

  // Sync slider → value input
	valueInput.addEventListener("input", () => {
	  const value = parseFloat(valueInput.value);

	  if (value > parseFloat(slider.max)) {
		slider.max = value;
		if (maxInput) maxInput.value = value;
	  }

	  if (value < parseFloat(slider.min)) {
		slider.min = value;
		if (minInput) minInput.value = value;
	  }

	  slider.value = value;
	  drawGaborGrating();
	  updatePeriodsLabel(); //
	});

  // Sync min input
  if (minInput) {
    minInput.addEventListener("input", () => {
      slider.min = minInput.value;
      if (parseFloat(slider.value) < parseFloat(slider.min)) {
        slider.value = slider.min;
        valueInput.value = slider.min;
      }
      drawGaborGrating();
    });
  }

  // Sync max input
  if (maxInput) {
    maxInput.addEventListener("input", () => {
      slider.max = maxInput.value;
      if (parseFloat(slider.value) > parseFloat(slider.max)) {
        slider.value = slider.max;
        valueInput.value = slider.max;
      }
      drawGaborGrating();
    });
  }

  // Sync step input
  if (stepInput) {
    stepInput.addEventListener("input", () => {
      slider.step = stepInput.value;
    });
  }
}

	
	
window.addEventListener("load", () => {
  bindSliderAndInputs("orientation");
  bindSliderAndInputs("phase");
  bindSliderAndInputs("periods");
  bindSliderAndInputs("sigma");
  bindSliderAndInputs("size");

  updateColorPreviews();
  drawGaborGrating();
  updatePeriodsLabel(); 
});


function updatePeriodsLabel() {
  const sizeInput = document.getElementById("sizeInput");
  const periods = parseFloat(periodsSlider.value);
  const downloadSize = parseFloat(sizeInput.value);
  const frequency = periods / downloadSize;

  const periodsValue = document.getElementById("periodsValue");
  const freqWarning = document.getElementById("freqWarning");

  periodsValue.textContent = `${periods} (freq: ${frequency.toFixed(4)} cyc/px)`;

  // Show warning if frequency ≥ 1
  if (frequency >= 0.5 && freqWarning) {
    freqWarning.style.display = "inline";
  } else if (freqWarning) {
    freqWarning.style.display = "none";
  }
}