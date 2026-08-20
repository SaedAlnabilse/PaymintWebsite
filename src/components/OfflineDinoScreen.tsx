import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RefreshCw, Volume2, VolumeX, Wifi, WifiOff } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

// ============================================================================
// Dino Pixel Sprites (Authentic pixel maps)
// ============================================================================

// T-Rex Sprite: 44x47
// 0: transparent, 1: dark gray / sprite color, 2: eye
const DINO_STAND_RAW = [
  "......................11111111",
  ".....................111111111",
  ".....................111111111",
  ".....................111121111",
  ".....................111111111",
  ".....................111111111",
  ".....................11111....",
  ".....................11111111.",
  "1...................11111......",
  "11.................111111111..",
  "111...............1111111.....",
  "1111.............111111111....",
  "11111...........111111111.....",
  "111111.........1111111111.....",
  ".111111.......11111111111.....",
  "..111111.....111111111111.....",
  "...111111111111111111111......",
  "....11111111111111111111......",
  ".....1111111111111111111......",
  "......111111111111111111......",
  ".......11111111111111111......",
  "........111111111111111.......",
  ".........11111111111111.......",
  "..........11111111111.........",
  "...........111111111..........",
  "............1111111...........",
  ".............11111............",
  "..............111.............",
  "..............1.1.............",
  "..............1.1.............",
  "..............1.1.............",
  "..............1.1.............",
  ".............11.11............",
];

const DINO_RUN1_RAW = [
  "......................11111111",
  ".....................111111111",
  ".....................111111111",
  ".....................111121111",
  ".....................111111111",
  ".....................111111111",
  ".....................11111....",
  ".....................11111111.",
  "1...................11111......",
  "11.................111111111..",
  "111...............1111111.....",
  "1111.............111111111....",
  "11111...........111111111.....",
  "111111.........1111111111.....",
  ".111111.......11111111111.....",
  "..111111.....111111111111.....",
  "...111111111111111111111......",
  "....11111111111111111111......",
  ".....1111111111111111111......",
  "......111111111111111111......",
  ".......11111111111111111......",
  "........111111111111111.......",
  ".........11111111111111.......",
  "..........11111111111.........",
  "...........111111111..........",
  "............1111111...........",
  ".............11111............",
  "..............111.............",
  "..............1..1............",
  "..............1...1...........",
  "..............1...............",
  ".............11...............",
];

const DINO_RUN2_RAW = [
  "......................11111111",
  ".....................111111111",
  ".....................111111111",
  ".....................111121111",
  ".....................111111111",
  ".....................111111111",
  ".....................11111....",
  ".....................11111111.",
  "1...................11111......",
  "11.................111111111..",
  "111...............1111111.....",
  "1111.............111111111....",
  "11111...........111111111.....",
  "111111.........1111111111.....",
  ".111111.......11111111111.....",
  "..111111.....111111111111.....",
  "...111111111111111111111......",
  "....11111111111111111111......",
  ".....1111111111111111111......",
  "......111111111111111111......",
  ".......11111111111111111......",
  "........111111111111111.......",
  ".........11111111111111.......",
  "..........11111111111.........",
  "...........111111111..........",
  "............1111111...........",
  ".............11111............",
  "..............111.............",
  ".............1...1............",
  "............1.....1...........",
  "..................1...........",
  ".................11...........",
];

const DINO_DEAD_RAW = [
  "......................11111111",
  ".....................111111111",
  ".....................111111111",
  ".....................1111.1111",
  ".....................111.1.111",
  ".....................1111.1111",
  ".....................11111....",
  ".....................11111111.",
  "1...................11111......",
  "11.................111111111..",
  "111...............1111111.....",
  "1111.............111111111....",
  "11111...........111111111.....",
  "111111.........1111111111.....",
  ".111111.......11111111111.....",
  "..111111.....111111111111.....",
  "...111111111111111111111......",
  "....11111111111111111111......",
  ".....1111111111111111111......",
  "......111111111111111111......",
  ".......11111111111111111......",
  "........111111111111111.......",
  ".........11111111111111.......",
  "..........11111111111.........",
  "...........111111111..........",
  "............1111111...........",
  ".............11111............",
  "..............111.............",
  "..............1.1.............",
  "..............1.1.............",
  ".............11.11............",
];

const CACTUS_SMALL = [
  "....1....",
  "....1....",
  ".1..1..1.",
  ".1..1..1.",
  ".1111111.",
  "....1....",
  "....1....",
  "....1....",
  "....1....",
  "....1....",
  "....1....",
  "....1....",
];

const CACTUS_LARGE = [
  ".....11.....",
  ".....11.....",
  "..1..11..1..",
  "..1..11..1..",
  "..1..11..1..",
  "..11111111..",
  ".....11.....",
  ".....11.....",
  ".....11.....",
  ".....11.....",
  ".....11.....",
  ".....11.....",
  ".....11.....",
  ".....11.....",
  ".....11.....",
  ".....11.....",
];

const PTERO_FRAME1 = [
  ".............111....",
  "...........111111...",
  "..........11111111..",
  "..........11111111..",
  "11.......1111111111.",
  ".111....111111111111",
  "..1111111111111111..",
  "...11111111111111...",
  "....11111111111.....",
  ".....1111111........",
  "......111...........",
];

const PTERO_FRAME2 = [
  ".............111....",
  "...........111111...",
  "..........11111111..",
  "..........11111111..",
  ".........1111111111.",
  "........111111111111",
  "..1111111111111111..",
  ".111111111111111....",
  "111...111111111.....",
  "1......1111111......",
  "........111.........",
];

// Helper to render pixel matrix on canvas
function drawSprite(
  ctx: CanvasRenderingContext2D,
  raw: string[],
  x: number,
  y: number,
  scale: number = 2,
  color: string = '#a8a8a8',
  eyeColor: string = '#202124'
) {
  for (let r = 0; r < raw.length; r++) {
    const row = raw[r];
    for (let c = 0; c < row.length; c++) {
      const char = row[c];
      if (char === '1') {
        ctx.fillStyle = color;
        ctx.fillRect(x + c * scale, y + r * scale, scale, scale);
      } else if (char === '2') {
        ctx.fillStyle = eyeColor;
        ctx.fillRect(x + c * scale, y + r * scale, scale, scale);
      }
    }
  }
}

// Retro 8-bit sound generator using Web Audio API
class RetroAudio {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  jump() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // AudioContext policy catch
    }
  }

  score() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.2);
    } catch {
      // AudioContext policy catch
    }
  }

  die() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(70, now + 0.25);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.25);
    } catch {
      // AudioContext policy catch
    }
  }
}

interface Obstacle {
  x: number;
  y: number;
  type: 'cactus_small' | 'cactus_large' | 'ptero';
  pteroHeight?: 'low' | 'mid' | 'high';
  width: number;
  height: number;
}

interface Cloud {
  x: number;
  y: number;
  speed: number;
}

interface Star {
  x: number;
  y: number;
}

interface OfflineDinoScreenProps {
  forceShow?: boolean;
}

export function OfflineDinoScreen({ forceShow = false }: OfflineDinoScreenProps = {}) {
  const { isOffline, isChecking, checkConnection } = useNetworkStatus();
  const [bypassed, setBypassed] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const audioRef = useRef<RetroAudio>(new RetroAudio());

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'running' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('mintcom_dino_hi') || '0', 10) || 0;
    } catch {
      return 0;
    }
  });

  // Game Engine State Refs
  const stateRef = useRef({
    gameState: 'idle' as 'idle' | 'running' | 'gameover',
    dinoY: 0,
    dinoVelocityY: 0,
    isJumping: false,
    isDucking: false,
    groundY: 130,
    speed: 6,
    score: 0,
    highScore: 0,
    obstacles: [] as Obstacle[],
    clouds: [] as Cloud[],
    stars: [] as Star[],
    groundOffset: 0,
    groundBumps: [] as { x: number; y: number; len: number }[],
    frameCount: 0,
    lastObstacleSpawn: 0,
    minObstacleGap: 240,
    canvasWidth: 600,
    canvasHeight: 160,
    dinoScale: 1.5,
  });

  // Update high score ref
  useEffect(() => {
    stateRef.current.highScore = highScore;
  }, [highScore]);

  // Update muted state in audio
  useEffect(() => {
    audioRef.current.muted = soundMuted;
  }, [soundMuted]);

  // Initialize ground bumps and clouds
  useEffect(() => {
    const bumps = [];
    for (let x = 0; x < 1200; x += Math.floor(Math.random() * 40 + 20)) {
      bumps.push({
        x,
        y: Math.random() > 0.5 ? 1 : 2,
        len: Math.floor(Math.random() * 4) + 1,
      });
    }
    stateRef.current.groundBumps = bumps;

    // Initial clouds
    stateRef.current.clouds = [
      { x: 100, y: 30, speed: 0.5 },
      { x: 320, y: 45, speed: 0.6 },
      { x: 500, y: 20, speed: 0.4 },
    ];

    // Stars
    stateRef.current.stars = [
      { x: 80, y: 15 },
      { x: 230, y: 25 },
      { x: 410, y: 18 },
      { x: 550, y: 35 },
    ];
  }, []);

  // Start / Jump Handler
  const handleJump = useCallback(() => {
    const s = stateRef.current;
    if (s.gameState === 'idle') {
      s.gameState = 'running';
      s.score = 0;
      s.speed = 6;
      s.obstacles = [];
      s.dinoY = 0;
      s.dinoVelocityY = -10.5;
      s.isJumping = true;
      setGameState('running');
      setScore(0);
      audioRef.current.jump();
      return;
    }

    if (s.gameState === 'gameover') {
      s.gameState = 'running';
      s.score = 0;
      s.speed = 6;
      s.obstacles = [];
      s.dinoY = 0;
      s.dinoVelocityY = -10.5;
      s.isJumping = true;
      setGameState('running');
      setScore(0);
      audioRef.current.jump();
      return;
    }

    if (s.gameState === 'running' && !s.isJumping) {
      s.dinoVelocityY = -10.5;
      s.isJumping = true;
      audioRef.current.jump();
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    if (!isOffline && bypassed) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleJump();
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        if (stateRef.current.isJumping) {
          // Fast drop
          stateRef.current.dinoVelocityY += 8;
        }
        stateRef.current.isDucking = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown') {
        stateRef.current.isDucking = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOffline, bypassed, handleJump]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof canvas.getContext !== 'function') return;
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d');
    } catch {
      return;
    }
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const s = stateRef.current;
      const width = canvas.width;
      const height = canvas.height;
      const groundY = 135;
      const dinoX = 40;
      const scale = s.dinoScale;

      ctx.clearRect(0, 0, width, height);

      // Background color matches Chrome dark mode
      ctx.fillStyle = '#202124';
      ctx.fillRect(0, 0, width, height);

      // Colors
      const spriteColor = '#9aa0a6'; // Light gray sprite color like Chrome dark theme
      const eyeColor = '#202124';
      const groundColor = '#5f6368';

      // 1. Draw Clouds & Stars
      ctx.fillStyle = '#3c4043';
      s.stars.forEach((star) => {
        ctx.fillRect(star.x, star.y, 2, 2);
      });

      s.clouds.forEach((cloud) => {
        // Draw 8-bit style cloud
        ctx.fillStyle = '#3c4043';
        ctx.fillRect(cloud.x, cloud.y + 4, 32, 6);
        ctx.fillRect(cloud.x + 6, cloud.y, 20, 12);
        ctx.fillRect(cloud.x + 12, cloud.y - 4, 12, 16);

        if (s.gameState === 'running') {
          cloud.x -= cloud.speed;
          if (cloud.x < -40) cloud.x = width + Math.random() * 50;
        }
      });

      // 2. Draw Horizon Ground Line
      ctx.strokeStyle = groundColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();

      // Ground bumps
      ctx.fillStyle = groundColor;
      s.groundBumps.forEach((bump) => {
        const renderX = (bump.x - s.groundOffset) % (width + 200);
        if (renderX >= -20 && renderX <= width + 20) {
          ctx.fillRect(renderX, groundY + bump.y, bump.len * 2, 1);
        }
      });

      // 3. Update Dino Physics & Animation
      if (s.gameState === 'running') {
        s.frameCount++;
        s.groundOffset += s.speed;

        // Score
        if (s.frameCount % 5 === 0) {
          s.score += 1;
          setScore(s.score);

          // 100 pt ding chime
          if (s.score > 0 && s.score % 100 === 0) {
            audioRef.current.score();
          }

          // Gradually speed up
          if (s.score % 150 === 0 && s.speed < 13) {
            s.speed += 0.4;
          }
        }

        // Gravity
        s.dinoY += s.dinoVelocityY;
        s.dinoVelocityY += 0.65; // gravity

        if (s.dinoY >= 0) {
          s.dinoY = 0;
          s.dinoVelocityY = 0;
          s.isJumping = false;
        }

        // Spawn Obstacles
        s.lastObstacleSpawn += s.speed;
        const currentGap = s.minObstacleGap + Math.random() * 160;

        if (s.lastObstacleSpawn > currentGap) {
          s.lastObstacleSpawn = 0;
          const rand = Math.random();
          if (s.score > 250 && rand < 0.25) {
            // Pterodactyl bird
            const heights: ('low' | 'mid' | 'high')[] = ['low', 'mid', 'high'];
            const chosen = heights[Math.floor(Math.random() * heights.length)];
            const yOffset = chosen === 'low' ? 30 : chosen === 'mid' ? 55 : 75;
            s.obstacles.push({
              x: width + 20,
              y: groundY - yOffset,
              type: 'ptero',
              pteroHeight: chosen,
              width: 28 * scale,
              height: 16 * scale,
            });
          } else if (rand < 0.6) {
            // Large Cactus
            s.obstacles.push({
              x: width + 20,
              y: groundY - 16 * scale,
              type: 'cactus_large',
              width: 12 * scale,
              height: 16 * scale,
            });
          } else {
            // Small Cactus
            s.obstacles.push({
              x: width + 20,
              y: groundY - 12 * scale,
              type: 'cactus_small',
              width: 9 * scale,
              height: 12 * scale,
            });
          }
        }

        // Update Obstacles
        for (let i = s.obstacles.length - 1; i >= 0; i--) {
          const obs = s.obstacles[i];
          obs.x -= s.speed;
          if (obs.x + obs.width < -50) {
            s.obstacles.splice(i, 1);
          }
        }
      }

      // 4. Draw Obstacles
      s.obstacles.forEach((obs) => {
        if (obs.type === 'cactus_small') {
          drawSprite(ctx, CACTUS_SMALL, obs.x, obs.y, scale, spriteColor, eyeColor);
        } else if (obs.type === 'cactus_large') {
          drawSprite(ctx, CACTUS_LARGE, obs.x, obs.y, scale, spriteColor, eyeColor);
        } else if (obs.type === 'ptero') {
          const pteroFrame = Math.floor(s.frameCount / 12) % 2 === 0 ? PTERO_FRAME1 : PTERO_FRAME2;
          drawSprite(ctx, pteroFrame, obs.x, obs.y, scale, spriteColor, eyeColor);
        }
      });

      // 5. Draw Dino
      const actualDinoY = groundY - 33 * scale + s.dinoY;
      let dinoSprite = DINO_STAND_RAW;

      if (s.gameState === 'gameover') {
        dinoSprite = DINO_DEAD_RAW;
      } else if (s.isJumping) {
        dinoSprite = DINO_STAND_RAW;
      } else if (s.gameState === 'running') {
        dinoSprite = Math.floor(s.frameCount / 6) % 2 === 0 ? DINO_RUN1_RAW : DINO_RUN2_RAW;
      }

      drawSprite(ctx, dinoSprite, dinoX, actualDinoY, scale, spriteColor, eyeColor);

      // 6. Collision Detection (Forgiving bounding boxes)
      if (s.gameState === 'running') {
        const dinoBox = {
          x: dinoX + 6,
          y: actualDinoY + 4,
          w: 22 * scale - 8,
          h: 33 * scale - 6,
        };

        for (const obs of s.obstacles) {
          const obsBox = {
            x: obs.x + 3,
            y: obs.y + 3,
            w: obs.width - 6,
            h: obs.height - 6,
          };

          if (
            dinoBox.x < obsBox.x + obsBox.w &&
            dinoBox.x + dinoBox.w > obsBox.x &&
            dinoBox.y < obsBox.y + obsBox.h &&
            dinoBox.y + dinoBox.h > obsBox.y
          ) {
            // Collision!
            s.gameState = 'gameover';
            setGameState('gameover');
            audioRef.current.die();

            if (s.score > s.highScore) {
              s.highScore = s.score;
              setHighScore(s.score);
              try {
                localStorage.setItem('mintcom_dino_hi', s.score.toString());
              } catch {
                // Ignore localStorage errors
              }
            }
            break;
          }
        }
      }

      // 7. Draw Score and High Score in Top Right
      if (s.gameState !== 'idle') {
        ctx.font = 'bold 13px "Courier New", Courier, monospace';
        ctx.fillStyle = '#757575';
        ctx.textAlign = 'right';

        const pad = (num: number, size: number) => {
          let str = num.toString();
          while (str.length < size) str = '0' + str;
          return str;
        };

        const hiText = s.highScore > 0 ? `HI ${pad(s.highScore, 5)}  ` : '';
        const scoreText = `${hiText}${pad(s.score, 5)}`;
        ctx.fillText(scoreText, width - 20, 25);
      }

      // 8. Draw Game Over Overlay & Restart Icon
      if (s.gameState === 'gameover') {
        ctx.font = 'bold 14px "Segoe UI", Roboto, system-ui, sans-serif';
        ctx.fillStyle = '#9aa0a6';
        ctx.textAlign = 'center';
        ctx.letterSpacing = '3px';
        ctx.fillText('G A M E   O V E R', width / 2, groundY - 45);

        // Draw restart circle arrow icon
        const restartX = width / 2;
        const restartY = groundY - 15;
        ctx.strokeStyle = '#9aa0a6';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(restartX, restartY, 11, 0.4 * Math.PI, 1.9 * Math.PI);
        ctx.stroke();

        // Arrow tip
        ctx.beginPath();
        ctx.moveTo(restartX + 9, restartY - 8);
        ctx.lineTo(restartX + 9, restartY - 1);
        ctx.lineTo(restartX + 16, restartY - 5);
        ctx.fillStyle = '#9aa0a6';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const [checkResult, setCheckResult] = useState<'idle' | 'online' | 'offline'>('idle');
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  const handleCheckConnection = async () => {
    setCheckResult('idle');
    const online = await checkConnection();
    if (online) {
      setCheckResult('online');
      setTimeout(() => {
        if (window.location.pathname === '/offline') {
          window.location.href = '/';
        } else {
          setBypassed(true);
          window.location.reload();
        }
      }, 1000);
    } else {
      setCheckResult('offline');
      setTimeout(() => {
        setCheckResult('idle');
      }, 4000);
    }
  };

  // Only render if offline (or forced) and not bypassed
  if ((!isOffline && !forceShow) || (bypassed && !forceShow)) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[999999] bg-[#202124] text-[#9aa0a6] flex flex-col items-center justify-center p-4 select-none overflow-y-auto font-sans antialiased"
      role="region"
      aria-label="No Internet Connection"
    >
      <div className="w-full max-w-xl flex flex-col items-start px-2 sm:px-6 py-6">
        {/* Dinosaur Runner Canvas Container */}
        <div
          className="relative w-full max-w-lg bg-[#202124] rounded cursor-pointer overflow-hidden border border-gray-800/40 shadow-inner"
          onClick={handleJump}
          title="Click or press Space to play"
        >
          <canvas
            ref={canvasRef}
            width={560}
            height={155}
            className="w-full h-auto block"
          />

          {/* Sound & Controls Toolbar */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSoundMuted((prev) => !prev);
              }}
              aria-label={soundMuted ? 'Unmute game sounds' : 'Mute game sounds'}
              className="p-1.5 rounded text-gray-400 hover:text-white bg-gray-900/60 hover:bg-gray-800 transition-colors"
              title={soundMuted ? 'Unmute' : 'Mute'}
            >
              {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Text Header & Instructions (Matches Screenshot Exactly) */}
        <div className="mt-5 w-full">
          <h1 className="text-xl sm:text-2xl font-medium text-[#e8eaed] mb-4 tracking-tight">
            {gameState === 'gameover'
              ? 'Press space to play again'
              : gameState === 'running'
              ? `Score: ${score}`
              : 'Press space to play'}
          </h1>

          <div className="text-sm sm:text-base text-[#9aa0a6] space-y-2 mb-6">
            <p className="font-normal text-[#bdc1c6]">Try:</p>
            <ul className="list-disc list-inside space-y-2 pl-1 text-[#9aa0a6]">
              <li
                onClick={() => {
                  setExpandedTip(expandedTip === 'cables' ? null : 'cables');
                  handleCheckConnection();
                }}
                className="cursor-pointer hover:text-white transition-colors"
                title="Click to check connection and view advice"
              >
                <span>Checking the network cables, modem, and router</span>
                {expandedTip === 'cables' && (
                  <div className="mt-2 ml-5 text-xs text-gray-400 bg-gray-900/80 p-3 rounded border border-gray-800 space-y-1">
                    <p>1. Unplug power cable from modem/router for 10 seconds.</p>
                    <p>2. Plug back in and wait 1 minute for lights to turn solid green.</p>
                    <p>3. Check that Ethernet / LAN cables are securely seated.</p>
                  </div>
                )}
              </li>

              <li
                onClick={() => {
                  setExpandedTip(expandedTip === 'wifi' ? null : 'wifi');
                  handleCheckConnection();
                }}
                className="cursor-pointer hover:text-white transition-colors"
                title="Click to check Wi-Fi connection"
              >
                <span>Reconnecting to Wi-Fi</span>
                {expandedTip === 'wifi' && (
                  <div className="mt-2 ml-5 text-xs text-gray-400 bg-gray-900/80 p-3 rounded border border-gray-800 space-y-1">
                    <p>1. Turn off Wi-Fi in device settings and turn it back on.</p>
                    <p>2. Verify you are connected to the correct network.</p>
                    <p>3. Check if Airplane Mode is accidentally turned on.</p>
                  </div>
                )}
              </li>
            </ul>
          </div>

          <div className="text-xs sm:text-sm font-mono tracking-wide text-[#70757a] uppercase mb-6">
            ERR_INTERNET_DISCONNECTED
          </div>

          {/* Connection Status Feedback Banner */}
          {checkResult === 'online' && (
            <div className="mb-4 p-2.5 bg-emerald-950/80 border border-emerald-600/60 rounded text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-400" />
              <span>Internet connected! Reconnecting now...</span>
            </div>
          )}

          {checkResult === 'offline' && (
            <div className="mb-4 p-2.5 bg-red-950/80 border border-red-800/60 rounded text-red-300 text-xs sm:text-sm flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-red-400" />
              <span>Still offline. Could not reach server. Please check your network and try again.</span>
            </div>
          )}

          {/* Action Bar (Check Connection, Reconnect, Continue) */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-800/80 w-full">
            <button
              onClick={handleCheckConnection}
              disabled={isChecking}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-[#8ab4f8] text-[#202124] hover:bg-[#aecbfa] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8ab4f8] focus:ring-offset-2 focus:ring-offset-[#202124] disabled:opacity-50 shadow-sm"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Checking network...
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4" />
                  Check Connection
                </>
              )}
            </button>

            <button
              onClick={() => setBypassed(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 transition-colors"
              title="Dismiss offline screen and browse cached content"
            >
              <WifiOff className="w-3.5 h-3.5" />
              Use Cached Version
            </button>
          </div>

          {/* Mobile Tap Hint */}
          <p className="sm:hidden text-xs text-gray-500 mt-4 text-center w-full">
            💡 Tap the dinosaur screen above to jump & play
          </p>
        </div>
      </div>
    </div>
  );
}
