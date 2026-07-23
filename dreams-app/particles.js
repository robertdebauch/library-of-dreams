import * as THREE from 'three';

(function() {
  const container = document.getElementById('particle-container');
  if (!container) return;

  const width = window.innerWidth;
  const isSmallPhone = width < 640;
  const isTablet = width >= 640 && width < 1024;

  const params = { 
    size: isSmallPhone ? 1.1 : (isTablet ? 1.4 : 1.6), 
    brightnessThreshold: isSmallPhone ? 0.05 : 0.2,
    driftSpeedX: 0.2, 
    driftSpeedY: 0.5, 
    lifeRange: [4, 8], 
    step: isSmallPhone ? 4 : (isTablet ? 3 : 2),
    targetFPS: 15
  };

  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); 
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x121212, 1.0); // фикс фона
  container.appendChild(renderer.domElement);

  const camera = new THREE.OrthographicCamera(
    container.clientWidth / -2, container.clientWidth / 2, 
    container.clientHeight / 2, container.clientHeight / -2, 
    1, 1000
  );
  camera.position.z = 100;

  let particles;
  let particleData = [];
  let lastFrameTime = 0;

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = 'https://cdn.jsdelivr.net/gh/robertdebauch/library-of-dreams@main/assets/image_var_2.png';

  img.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    const positions = [], colors = [];

    for (let y = 0; y < canvas.height; y += params.step) {
      for (let x = 0; x < canvas.width; x += params.step) {
        const index = (y * canvas.width + x) * 4;
        const brightness = (data[index] + data[index+1] + data[index+2]) / 3 / 255;

        if (brightness > params.brightnessThreshold && data[index + 3] > 128) { 
          const px = (x - canvas.width / 2);
          const py = (-y + canvas.height / 2);

          positions.push(px, py, 0);
          colors.push(data[index]/255, data[index+1]/255, data[index+2]/255);

          const isCore = brightness < 0.15;

          particleData.push({
            originX: px,
            originY: py,
            vx: (Math.random() - 0.5) * params.driftSpeedX,
            vy: (Math.random() * 0.5 + 0.5) * params.driftSpeedY,
            life: Math.random() * (params.lifeRange[1] - params.lifeRange[0]) + params.lifeRange[0],
            age: Math.random() * 5,
            phase: Math.random() * Math.PI * 2,
            role: isCore ? 'core' : 'flake'
          });
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({ size: params.size, vertexColors: true, transparent: true, opacity: 0.8 });
    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    function updateCameraScale() {
      if (!img.width) return;
      camera.left = container.clientWidth / -2;
      camera.right = container.clientWidth / 2;
      camera.top = container.clientHeight / 2;
      camera.bottom = container.clientHeight / -2;
      camera.zoom = Math.max(container.clientWidth / img.width, container.clientHeight / img.height);
      camera.updateProjectionMatrix();
    }

    updateCameraScale();

    function animate(currentTime) {
      requestAnimationFrame(animate);

      const frameInterval = 1000 / params.targetFPS;
      const deltaTime = currentTime - lastFrameTime;

      if (deltaTime < frameInterval) return; 
      lastFrameTime = currentTime;

      if (!particles) return;
      const pos = particles.geometry.attributes.position.array;

      for (let i = 0; i < particleData.length; i++) {
        const p = particleData[i];
        const idx = i * 3;

        if (p.role === 'core') {
          const breathe = Math.sin(p.age * 0.5 + p.phase) * 0.5;
          pos[idx] = p.originX + breathe;
          pos[idx + 1] = p.originY + breathe;
          p.age += 0.01;
        } else {
          p.age += 0.02;
          if (p.age >= p.life) {
            p.age = 0;
            pos[idx] = p.originX;
            pos[idx + 1] = p.originY;
          } else {
            const travelDistance = p.age * 12;
            const noiseX = Math.sin(p.age * 2 + p.phase) * 1.0;
            const noiseY = Math.cos(p.age * 1.5 + p.phase) * 1.0;
            pos[idx] = p.originX + (p.vx * travelDistance) + noiseX;
            pos[idx + 1] = p.originY + (p.vy * travelDistance) + noiseY;
          }
        }
      }

      particles.geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    }

    animate(0);
  };

  // ФИКС РАЗМЕРОВ: ResizeObserver следит за изменениями контейнера
  const resizeObserver = new ResizeObserver(() => {
    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.left = container.clientWidth / -2;
    camera.right = container.clientWidth / 2;
    camera.top = container.clientHeight / 2;
    camera.bottom = container.clientHeight / -2;
    camera.updateProjectionMatrix();
  });
  resizeObserver.observe(container);
})();