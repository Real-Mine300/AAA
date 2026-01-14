/**
 * Iron Rush - Educational Mini-Game
 * Player controls a red blood cell collecting iron-rich foods
 */

(function() {
  'use strict';

  const canvas = document.getElementById('ironRushCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const gameContainer = canvas.parentElement;

  // Game state
  let gameState = 'menu'; // 'menu', 'playing', 'paused', 'ended'
  let ironLevel = 50; // 0-100
  let score = 0;
  let gameTime = 0;
  let keys = {};
  let touchStartX = 0;
  let touchStartY = 0;

  // Player (red blood cell)
  const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    speed: 3,
    color: '#EF4444'
  };

  // Items arrays
  const items = [];
  const spawnRate = 0.02;
  const itemSpeed = 2;

  // Item types
  const itemTypes = {
    positive: [
      { name: 'meat', color: '#8B4513', symbol: '🥩' },
      { name: 'spinach', color: '#228B22', symbol: '🥬' },
      { name: 'beans', color: '#8B4513', symbol: '🫘' },
      { name: 'vitaminC', color: '#FF8C00', symbol: '🍊' }
    ],
    negative: [
      { name: 'tea', color: '#D2B48C', symbol: '🍵' },
      { name: 'coffee', color: '#6F4E37', symbol: '☕' },
      { name: 'milk', color: '#F5F5DC', symbol: '🥛' }
    ]
  };

  // Resize canvas
  function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.offsetWidth;
    canvas.height = Math.min(400, window.innerHeight * 0.5);
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Input handling
  document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === ' ' && gameState === 'playing') {
      gameState = 'paused';
      e.preventDefault();
    } else if (e.key === ' ' && gameState === 'paused') {
      gameState = 'playing';
      e.preventDefault();
    }
  });

  document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  // Touch controls
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    touchStartX = touch.clientX - rect.left;
    touchStartY = touch.clientY - rect.top;
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (gameState !== 'playing') return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;
    
    player.x += (touchX - touchStartX) * 0.1;
    player.y += (touchY - touchStartY) * 0.1;
    
    touchStartX = touchX;
    touchStartY = touchY;
  }, { passive: false });

  // Spawn items
  function spawnItem() {
    if (Math.random() > spawnRate) return;

    const isPositive = Math.random() > 0.4;
    const typeArray = isPositive ? itemTypes.positive : itemTypes.negative;
    const itemType = typeArray[Math.floor(Math.random() * typeArray.length)];

    items.push({
      x: Math.random() * canvas.width,
      y: -20,
      radius: 15,
      type: itemType.name,
      isPositive: isPositive,
      color: itemType.color,
      symbol: itemType.symbol,
      speed: itemSpeed + Math.random() * 1
    });
  }

  // Update player movement
  function updatePlayer() {
    let moveX = 0;
    let moveY = 0;
    const speed = ironLevel < 30 ? player.speed * 0.5 : player.speed;

    if (keys['arrowleft'] || keys['a']) moveX = -speed;
    if (keys['arrowright'] || keys['d']) moveX = speed;
    if (keys['arrowup'] || keys['w']) moveY = -speed;
    if (keys['arrowdown'] || keys['s']) moveY = speed;

    player.x += moveX;
    player.y += moveY;

    // Keep player in bounds
    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));
  }

  // Update items
  function updateItems() {
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      item.y += item.speed;

      // Check collision
      const dx = item.x - player.x;
      const dy = item.y - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < player.radius + item.radius) {
        if (item.isPositive) {
          ironLevel = Math.min(100, ironLevel + 10);
          score += 10;
        } else {
          ironLevel = Math.max(0, ironLevel - 15);
          score = Math.max(0, score - 5);
        }
        items.splice(i, 1);
        continue;
      }

      // Remove off-screen items
      if (item.y > canvas.height + 20) {
        items.splice(i, 1);
      }
    }
  }

  // Draw functions
  function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner circle for red blood cell look
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawItems() {
    items.forEach(item => {
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw symbol (emoji as text)
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.symbol, item.x, item.y);
    });
  }

  function drawHUD() {
    // Iron meter background
    const meterX = 20;
    const meterY = 20;
    const meterWidth = 200;
    const meterHeight = 20;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(meterX, meterY, meterWidth, meterHeight);

    // Iron meter fill
    const fillWidth = (ironLevel / 100) * meterWidth;
    let meterColor = '#EF4444'; // Vitality Red
    if (ironLevel < 30) meterColor = '#DC2626'; // Low
    if (ironLevel > 70) meterColor = '#22C55E'; // Good

    ctx.fillStyle = meterColor;
    ctx.fillRect(meterX, meterY, fillWidth, meterHeight);

    // Iron meter text - BLACK for readability
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Iron: ${Math.round(ironLevel)}%`, meterX, meterY - 5);

    // Score - BLACK for readability
    ctx.fillText(`Score: ${score}`, meterX, meterY + 40);

    // Time - BLACK for readability
    const minutes = Math.floor(gameTime / 60);
    const seconds = Math.floor(gameTime % 60);
    ctx.fillText(`Time: ${minutes}:${seconds.toString().padStart(2, '0')}`, meterX, meterY + 60);
  }

  function drawMenu() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Iron Rush', canvas.width / 2, canvas.height / 2 - 80);

    ctx.font = '18px Arial';
    ctx.fillText('Collect iron-rich foods!', canvas.width / 2, canvas.height / 2 - 40);
    ctx.fillText('Avoid tea, coffee, and milk', canvas.width / 2, canvas.height / 2 - 10);

    ctx.font = '16px Arial';
    ctx.fillText('Arrow keys or WASD to move', canvas.width / 2, canvas.height / 2 + 40);
    ctx.fillText('Touch to move on mobile', canvas.width / 2, canvas.height / 2 + 70);

    ctx.fillStyle = '#EF4444';
    ctx.fillRect(canvas.width / 2 - 60, canvas.height / 2 + 110, 120, 40);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('START', canvas.width / 2, canvas.height / 2 + 135);
  }

  function drawPause() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    ctx.font = '16px Arial';
    ctx.fillText('Press SPACE to resume', canvas.width / 2, canvas.height / 2 + 40);
  }

  function drawEndScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    
    let ironStatus = 'Low';
    let statusColor = '#DC2626';
    if (ironLevel >= 50 && ironLevel < 80) {
      ironStatus = 'Normal';
      statusColor = '#F59E0B';
    } else if (ironLevel >= 80) {
      ironStatus = 'Strong';
      statusColor = '#22C55E';
    }

    ctx.fillText('Game Over!', canvas.width / 2, 80);
    ctx.font = '20px Arial';
    ctx.fillText(`Iron Level: ${ironStatus}`, canvas.width / 2, 130);
    
    ctx.fillStyle = statusColor;
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, 170);

    // Educational tips
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    const tips = getEducationalTips(ironLevel);
    ctx.fillText(tips[0], canvas.width / 2, 220);
    ctx.fillText(tips[1], canvas.width / 2, 250);

    ctx.fillStyle = '#EF4444';
    ctx.fillRect(canvas.width / 2 - 60, canvas.height - 80, 120, 40);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('RESTART', canvas.width / 2, canvas.height - 55);
  }

  function getEducationalTips(ironLevel) {
    if (ironLevel < 50) {
      return [
        '💡 Tip: Include lean meats, spinach, and beans in your diet',
        '💡 Vitamin C helps your body absorb iron better!'
      ];
    } else if (ironLevel < 80) {
      return [
        '💡 Tip: Maintain a balanced diet with iron-rich foods',
        '💡 Avoid drinking tea/coffee with iron-rich meals'
      ];
    } else {
      return [
        '💡 Tip: Great job! Keep up a healthy, iron-rich diet',
        '💡 Regular check-ups help monitor your iron levels'
      ];
    }
  }

  // Menu click handler
  canvas.addEventListener('click', (e) => {
    if (gameState === 'menu') {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const startX = canvas.width / 2 - 60;
      const startY = canvas.height / 2 + 110;
      if (x >= startX && x <= startX + 120 && y >= startY && y <= startY + 40) {
        startGame();
      }
    } else if (gameState === 'ended') {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const restartX = canvas.width / 2 - 60;
      const restartY = canvas.height - 80;
      if (x >= restartX && x <= restartX + 120 && y >= restartY && y <= restartY + 40) {
        startGame();
      }
    }
  });

  function startGame() {
    gameState = 'playing';
    ironLevel = 50;
    score = 0;
    gameTime = 0;
    items.length = 0;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
  }

  // Game loop
  let lastTime = 0;
  function gameLoop(currentTime) {
    if (!lastTime) lastTime = currentTime;
    const deltaTime = currentTime - lastTime;

    // Clear canvas
    const bgColor = getComputedStyle(document.body).getPropertyValue('--bg-primary').trim();
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'menu') {
      drawMenu();
    } else if (gameState === 'playing') {
      // Update
      updatePlayer();
      spawnItem();
      updateItems();
      gameTime += deltaTime / 1000;

      // Check game end
      if (gameTime >= 60) { // 60 seconds
        gameState = 'ended';
      }

      // Draw
      drawItems();
      drawPlayer();
      drawHUD();
    } else if (gameState === 'paused') {
      drawItems();
      drawPlayer();
      drawHUD();
      drawPause();
    } else if (gameState === 'ended') {
      drawEndScreen();
    }

    lastTime = currentTime;
    requestAnimationFrame(gameLoop);
  }

  // Start game loop
  gameLoop(0);
})();
