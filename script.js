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
        
        case "cosine":
          if (normalizedRadius > sigma) return 0;
          return Math.cos((Math.PI * normalizedRadius) / (2 * sigma));
        
        case "hann":
          if (normalizedRadius > sigma) return 0;
          return 0.5 * (1 + Math.cos(Math.PI * normalizedRadius / sigma));
        
        case "hamming":
          if (normalizedRadius > sigma) return 0;
          return 0.54 + 0.46 * Math.cos(Math.PI * normalizedRadius / sigma);
        
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
    function drawGaborGrating() {
      // Get current parameter values
      const angleDeg = parseFloat(orientationSlider.value);
      const angleRad = angleDeg * Math.PI / 180;
      const periods = parseInt(periodsSlider.value);
      const size = parseInt(sizeSlider.value);
      const frequency = periods / size;
      const phaseDeg = parseFloat(phaseSlider.value);
      const phaseRad = phaseDeg * Math.PI / 180;
      
      // Get color values
      const c1r = parseInt(color1R.value);
      const c1g = parseInt(color1G.value);
      const c1b = parseInt(color1B.value);
      const c2r = parseInt(color2R.value);
      const c2g = parseInt(color2G.value);
      const c2b = parseInt(color2B.value);
      
      // Update canvas dimensions
      canvas.width = canvas.height = size;
      
      // Update display values
      orientationValue.textContent = `${angleDeg}° (${angleRad.toFixed(2)} rad)`;
      periodsValue.textContent = `${periods} (freq: ${frequency.toFixed(4)} cyc/px)`;
      sizeValue.textContent = `${size} px`;
      phaseValue.textContent = `${phaseDeg}° (${phaseRad.toFixed(2)} rad)`;
      
      // Create image data
      const imageData = ctx.createImageData(size, size);
      const data = imageData.data;

      // Calculate center coordinates
      const centerX = size / 2;
      const centerY = size / 2;
      
      // Calculate sigma for envelope
      const sigmaScale = parseFloat(sigmaSlider.value);
      const sigma = (size / 6) * sigmaScale;
      
      // Update sigma display value
      sigmaValue.textContent = `σ = ${sigma.toFixed(1)} px`;

      // Generate the Gabor grating pixel by pixel
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          // Distance from center
          const dx = x - centerX;
          const dy = y - centerY;

          // Rotated x coordinate along grating orientation
          const xTheta = dx * Math.cos(angleRad) + dy * Math.sin(angleRad);

          // Calculate envelope value
          const envelope = calculateEnvelope(dx, dy, sigma, size);

          // Calculate sinusoidal grating
          const sinusoid = Math.cos(2 * Math.PI * frequency * xTheta + phaseRad);
          
          // Combine to form Gabor
          const gabor = envelope * sinusoid;

          // Map gabor value (-1 to 1) to color interpolation (0 to 1)
          const colorMix = (gabor + 1) / 2;
          
          // Linear interpolation between the two colors
          const r = Math.round(c2r + colorMix * (c1r - c2r));
          const g = Math.round(c2g + colorMix * (c1g - c2g));
          const b = Math.round(c2b + colorMix * (c1b - c2b));
          
          // Set pixel RGBA values in image data
          const index = (y * size + x) * 4;
          data[index] = r;
          data[index + 1] = g;
          data[index + 2] = b;
          data[index + 3] = 255; // Alpha (fully opaque)
        }
      }

      // Draw the image data to the canvas
      ctx.putImageData(imageData, 0, 0);
      
      // Update color previews
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
    downloadBtn.addEventListener('click', function() {
      // Get current parameters for filename
      const orientation = parseInt(orientationSlider.value);
      const phase = parseInt(phaseSlider.value);
      const periods = parseInt(periodsSlider.value);
      const size = parseInt(sizeSlider.value);
      
      // Create filename with properties
      const filename = `gabor_${currentEnvelope}_ori${orientation}_ph${phase}_per${periods}_sz${size}.png`;
      
      // Create temporary link for download
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    // Add event listeners to controls
    orientationSlider.addEventListener("input", drawGaborGrating);
    periodsSlider.addEventListener("input", drawGaborGrating);
    sizeSlider.addEventListener("input", drawGaborGrating);
    phaseSlider.addEventListener("input", drawGaborGrating);
    sigmaSlider.addEventListener("input", drawGaborGrating);
    
    // Color input event listeners
    color1R.addEventListener("input", drawGaborGrating);
    color1G.addEventListener("input", drawGaborGrating);
    color1B.addEventListener("input", drawGaborGrating);
    color2R.addEventListener("input", drawGaborGrating);
    color2G.addEventListener("input", drawGaborGrating);
    color2B.addEventListener("input", drawGaborGrating);

    // Initial draw on page load
    window.addEventListener("load", function() {
      updateColorPreviews();
      drawGaborGrating();
    });