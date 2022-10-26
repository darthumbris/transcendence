<script>
  import { Canvas, Layer, t } from 'svelte-canvas';
  import Background from './Background.svelte';
  // import Paddle from './Paddle.svelte';
  // import { mousex, mousey } from './mouse.js';

  let border = 100;
  let linethickness = 10;
  const paddle_h = 100;
  const paddle_w = 10;
  let mouse = {x: window.innerHeight / 4,
              y: window.innerHeight / 2};

  function drawPaddle(context) {
    // console.log("drawing paddle");
    context.save();
    context.lineWidth = 7;
    let x = mouse.x;
    let y = mouse.y - paddle_h / 2; 
    context.beginPath();
    context.fillStyle = 'rgba(190, 162, 28, 1)';
    context.strokeStyle = `rgba(222, 229, 19, 0.9)`;
    context.arc(x, y, paddle_w, Math.PI, 0);
    context.lineTo(x + paddle_w, y + paddle_h - paddle_w);
    context.arc(x, y - paddle_w + paddle_h, paddle_w, 0, Math.PI);
    context.lineTo(x - paddle_w, y);
    context.stroke();
    context.fill();
    context.restore();
  }

  $: render = ({ context}) => {
    context.fillStyle = `hsl(${$t / 40}, 100%, 50%)`;
    context.fillStyle = 'black';
    drawPaddle(context);
  };

  function handleMouseMove ({ clientX, clientY }) {
    mouse = {x: clientX, y: clientY};
    
    if (mouse.x < border + linethickness)
        mouse.x = border + linethickness;
    if (mouse.x > window.innerWidth - border - linethickness)
        mouse.x = window.innerWidth - border - linethickness;
    if (mouse.y < border + paddle_h / 2 + linethickness)
        mouse.y = border + paddle_h / 2 + linethickness;
    if (mouse.y > window.innerHeight - border - paddle_h / 2 - linethickness)
        mouse.y = window.innerHeight - border - paddle_h / 2 - linethickness;
      
  }
</script>

<Canvas 
  width={window.innerWidth}
  height={window.innerHeight}
  on:mousemove={handleMouseMove}>
  <Background />
  <!-- <Paddle /> -->
  <Layer {render} />
</Canvas>