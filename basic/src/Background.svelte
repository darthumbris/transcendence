<script>
    import { Layer } from 'svelte-canvas';

    const a = 2 * Math.PI / 6;
    const r = window.innerWidth / 40;
    const border = 100;
    const b_r = 10;
    const field_radius = window.innerWidth * 0.4;
    const goalHeight = 300;
    const goalWidth = 50;
    const color_grid = 'rgba(100, 100, 100, 0.5)'
    const color_l_f = 'rgba(213, 172, 28, 0.7)';
    const color_l_s = 'rgba(213, 172, 28, 0.9)';
    const color_r_f = 'rgba(65, 190, 220, 0.7)';
    const color_r_s = 'rgba(65, 190, 220, 0.9)';
    const color_stop = "rgba(50,50,50, 0.95)";
    const color_border = `rgba(222, 229, 19, 0.9)`;
    const canvasSize = window.innerWidth * window.innerHeight;
    const starsFraction = canvasSize / 6000;
    let star_arr = [];
    const offset = border - 10;


    const setup = ({ context, width, height }) => {
        context.webkitImageSmoothingEnabled = false;
        context.ImageSmoothingEnabled = false;
        for(let i = 0; i < starsFraction; i++) {
            //Set up random elements
            let rect = {
            x: random(2, width - 2),
            y: random(2, height - 2),
            a: random(0.7, 1),
            size: random(1, 5)
            };
            star_arr.push(rect);
        }
    }

    function drawHexagon(x, y, r, context) {
        context.beginPath();
        for (var i = 0; i < 6; i++) {
            context.lineTo(x + r * Math.cos(a * i), y + r * Math.sin(a * i));
        }
        context.stroke();
        
    }

    function drawGrid(width, height, context) {
        context.strokeStyle = color_grid;
        context.lineWidth = 5;
        
        for (let y = -3 * r; y + r * Math.sin(a) < height + r; y += r * Math.sin(a)) {
            for (let x = -r, j = 0; x + r * (1 + Math.cos(a)) < width + 3 * r; 
                x += r * (1 + Math.cos(a)), y += (-1) ** j++ * r * Math.sin(a)) {
                drawHexagon(x, y, r, context);
            }
        }
        
    }

    function drawLeftField(width, height, context) {
        const gradient = context.createRadialGradient(border, height * 0.5, field_radius, border, height / 2, 0);
        gradient.addColorStop(1, color_l_s);
        gradient.addColorStop(0, color_stop);
        context.fillStyle = gradient;
        context.fillRect(offset, offset, width / 2 - offset, height - 2 * offset - 5);
    }

    function drawRightField(width, height, context) {
        const gradient = context.createRadialGradient(width, height * 0.5, field_radius, width, height / 2, 0);
        gradient.addColorStop(1, color_r_f);
        gradient.addColorStop(0, color_stop);
        context.fillStyle = gradient;
        context.fillRect(width / 2, offset, width / 2 - offset - 5, height - 2 * offset - 5);
    }

    function drawMiddleLine(width, height, context) {
        context.save();
        context.lineCap = 'square';
        context.strokeStyle = `rgba(200,200,200,0.5)`;
        context.fillStyle = 'rgba(100,100,100,0.4)';
        context.lineWidth = 10;
        context.beginPath();
        context.moveTo(width / 2, border);
        context.lineTo(width / 2, height / 2 - r);
        context.arc(width / 2, height / 2, r, 1.5 * Math.PI,  0.5 * Math.PI);
        context.moveTo(width / 2, height / 2 - r);
        context.arc(width / 2, height / 2, r, 1.5 * Math.PI,  0.5 * Math.PI, true);
        context.fill();
        context.moveTo(width / 2, height / 2 + r);
        context.lineTo(width / 2, height - border);
        context.closePath();
        context.stroke();
        context.restore();
    }

    function drawBorder(width, height, context) {
        context.lineWidth = 10;
        context.strokeStyle = color_border;
        context.beginPath();
        context.arc(border, border, b_r, Math.PI,  1.5 * Math.PI);
        context.lineTo(width - border, border - b_r);
        context.arc(width - border, border, b_r, 1.5 * Math.PI,  0);
        context.lineTo(width - border + b_r, height - border - b_r);
        context.arc(width - border, height - border - b_r, b_r, 0,  0.5 * Math.PI);
        context.lineTo(border, height - border);
        context.arc(border, height - border - b_r, b_r, 0.5 * Math.PI, Math.PI);
        context.lineTo(border - b_r, border);
        context.closePath();
        context.stroke();
    }

    function drawGoal(height, context, x, flip) {
        context.save();
        context.lineCap = 'square';
        context.lineWidth = 10;
        
        let y = height / 2 - goalHeight / 2;
        let offset_w;
        let offset_r; 
        if (flip) {
        context.strokeStyle = color_l_s;
        context.fillStyle = color_l_f;
        offset_w = -goalWidth;
        offset_r = -b_r;
        }
        else {
        context.strokeStyle = color_r_s;
        context.fillStyle = color_r_f;
        offset_w = goalWidth;
        offset_r = b_r;
        }
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + offset_w, y);
        context.arc(x + offset_w, y + b_r, b_r, 1.5 * Math.PI,  Math.PI * flip, flip);
        context.lineTo(x + offset_w + offset_r, y + goalHeight);
        context.arc(x + offset_w, y + goalHeight, b_r, Math.PI * flip,  0.5 * Math.PI, flip);
        context.lineTo(x, y + b_r + goalHeight);
        context.fill();
        context.stroke();
        context.restore();
    }

    function random(min, max) {
        return min + Math.random() * (max + 1 - min);
    }


    function drawStars(width, height, context) {
        context.save();
        context.fillStyle = '#ffffff';
        star_arr.forEach((element, index, array) => {
        context.globalAlpha = element.a;
        context.fillRect(element.x, element.y, element.size, element.size);
        });
        context.restore();
    }

    const render = ({ context, width, height }) => {
        context.lineCap = 'round';
        drawStars(width, height, context);
        drawGrid(width, height, context);
        drawLeftField(width, height, context);
        drawRightField(width, height, context);
        drawMiddleLine(width,height, context);    
        drawGoal(height, context, border - 10, true);
        drawGoal(height, context, width - border + 15, false);
        drawBorder(width, height, context);
    };
</script>


<Layer {setup} {render} />