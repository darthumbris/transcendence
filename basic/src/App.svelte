<script>
  import { Canvas, Layer, t } from 'svelte-canvas';
  import Background from './Background.svelte';
  // import Paddle from './Paddle.svelte';
  // import { mousex, mousey } from './mouse.js';

  let border = 100;
  const paddle_h = 100;
  const paddle_w = 10;
  const color_border = `rgba(222, 229, 19, 0.9)`;
  let mousex = border;
  let mousey = border;


  function drawPaddle(context) {
        // console.log("drawing paddle");
        context.save();
        context.lineWidth = 7;
        let x = mousex;
        let y = mousey - paddle_h / 2; 
        context.beginPath();
        const gradient = context.createRadialGradient(x - paddle_w / 2, y + paddle_h / 2, paddle_h / 2, x + paddle_w / 2,  y + paddle_h / 2, 0);
        gradient.addColorStop(1, 'rgba(190, 162, 28, 0.95)');
        gradient.addColorStop(0, 'rgba(255,255,255, 0.99)');
        // context.fillStyle = 'black';
        context.fillStyle = 'rgba(190, 162, 28, 1)';
        context.strokeStyle = gradient;
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
      // console.log("hey");
      mousex = clientX;
      mousey = clientY;
      
      if (mousex < border + 10) {
        mousex = border + 10;
        // console.log("smaller");
      }
      if (mousex > window.innerWidth - border - 10)
          mousex = window.innerWidth - border - 10;
      if (mousey < border)
          mousey = border;
      if (mousey > window.innerHeight - border - 100 - 10)
          mousey = window.innerHeight - border - 100 - 10;
      // console.log("mouse: ", mousex, ", ", mousey);
      
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