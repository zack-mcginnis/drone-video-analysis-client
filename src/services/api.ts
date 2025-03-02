interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

const BASE_URL = process.env.REACT_APP_API_URL;
const WS_URL = process.env.REACT_APP_WS_URL;

if (!BASE_URL) {
  throw new Error('REACT_APP_API_URL environment variable is not defined');
}

if (!WS_URL) {
  throw new Error('REACT_APP_WS_URL environment variable is not defined');
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    throw new ApiError(response.statusText, response.status);
  }

  const data = await response.json();
  return {
    data,
    status: response.status,
    message: response.statusText,
  };
}

export async function getData<T>(endpoint: string): Promise<ApiResponse<T>> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse<T>(response);
}

export async function postData<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<T>(response);
}

export async function putData<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<T>(response);
}

export async function deleteData<T>(endpoint: string): Promise<ApiResponse<T>> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse<T>(response);
}

// Singleton WebSocket manager to ensure only one connection
class WebSocketManager {
  private static instance: WebSocketManager | null = null;
  private ws: WebSocket | null = null;
  private url: string;
  private connected: boolean = false;
  private reconnectInterval: number = 2000;
  private pingInterval: number | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private connectionListeners: ((connected: boolean) => void)[] = [];
  private reconnecting: boolean = false;

  private constructor() {
    this.url = `${WS_URL}/ws/stream`;
  }

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  public connect(): void {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)
    ) {
      console.log('WebSocket connection already exists');
      return;
    }

    if (this.reconnecting) {
      console.log('Already attempting to reconnect');
      return;
    }

    try {
      console.log('Creating new WebSocket connection to', this.url);
      this.ws = new WebSocket(this.url);
      this.ws.binaryType = 'arraybuffer'; // Set to receive binary data directly

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.handleReconnect();
    }
  }

  private handleOpen(): void {
    console.log('WebSocket connection established');
    this.connected = true;
    this.reconnectAttempts = 0;
    this.reconnecting = false;

    // Notify all connection listeners
    this.connectionListeners.forEach((listener) => listener(true));

    // Start sending ping messages to keep connection alive
    this.pingInterval = window.setInterval(() => {
      if (this.connected && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Send ping every 30 seconds
  }

  private handleMessage(event: MessageEvent): void {
    try {
      // Check if the message is binary or text
      if (typeof event.data === 'string') {
        const message = JSON.parse(event.data);

        // Notify listeners based on message type
        if (this.listeners.has(message.type)) {
          this.listeners.get(message.type)?.forEach((callback) => callback(message));
        }

        // Notify generic message listeners
        if (this.listeners.has('message')) {
          this.listeners.get('message')?.forEach((callback) => callback(message));
        }
      } else {
        // Handle binary data
        if (this.listeners.has('binary')) {
          this.listeners.get('binary')?.forEach((callback) => callback(event.data));
        }
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket connection closed:', event.code, event.reason);
    this.connected = false;

    // Clear ping interval
    if (this.pingInterval !== null) {
      window.clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    // Notify all connection listeners
    this.connectionListeners.forEach((listener) => listener(false));

    // Attempt to reconnect
    this.handleReconnect();
  }

  private handleError(error: Event): void {
    console.error('WebSocket error:', error);
  }

  private handleReconnect(): void {
    if (this.reconnecting) return;

    this.reconnecting = true;

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    const delay = this.reconnectInterval * Math.min(Math.pow(1.5, this.reconnectAttempts), 30);
    console.log(
      `Attempting to reconnect in ${delay}ms... (Attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`
    );

    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.pingInterval !== null) {
      window.clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    this.connected = false;
    this.reconnecting = false;
  }

  public isConnected(): boolean {
    return this.connected && this.ws?.readyState === WebSocket.OPEN;
  }

  public addMessageListener(type: string, callback: (data: any) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)?.push(callback);
  }

  public removeMessageListener(type: string, callback: (data: any) => void): void {
    if (this.listeners.has(type)) {
      const callbacks = this.listeners.get(type) || [];
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  public addConnectionListener(callback: (connected: boolean) => void): void {
    this.connectionListeners.push(callback);

    // Immediately notify of current state
    if (this.isConnected()) {
      callback(true);
    }
  }

  public removeConnectionListener(callback: (connected: boolean) => void): void {
    const index = this.connectionListeners.indexOf(callback);
    if (index !== -1) {
      this.connectionListeners.splice(index, 1);
    }
  }

  public sendMessage(message: any): void {
    if (!this.isConnected()) {
      console.error('WebSocket is not connected');
      return;
    }

    try {
      this.ws?.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
    }
  }
}

// Define message types for better type safety
interface BaseWSMessage {
  type: string;
  [key: string]: unknown;
}

interface FrameMessage extends BaseWSMessage {
  type: 'frame';
  data: string;
  id?: number;
  timestamp?: string;
  width?: number;
  height?: number;
  format?: string;
}

// Frame buffer item with timestamp for seeking
interface FrameBufferItem {
  blob: Blob;
  width?: number;
  height?: number;
  timestamp: number; // Timestamp when frame was received
}

export class RTMPStreamViewer {
  private canvas: HTMLCanvasElement | null = null;
  private gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private texture: WebGLTexture | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private texCoordBuffer: WebGLBuffer | null = null;
  private connected: boolean = false;
  private frameQueue: Array<FrameBufferItem> = [];
  private frameBuffer: Array<FrameBufferItem> = []; // Store frames for seeking
  private isRendering: boolean = false;
  private frameCount: number = 0;
  private lastFrameTimestamp: number = 0;
  private frameProcessingTime: number = 0;
  private maxQueueSize: number = 10; // Limit queue size to prevent memory issues
  private maxBufferSize: number = 300; // Store up to 10 seconds at 30fps
  private frameDropped: number = 0;
  private imageCache: HTMLImageElement;
  private useWebGL2: boolean = false;
  private wsManager: WebSocketManager;
  private binaryMessageHandler: (data: ArrayBuffer) => void;
  private frameMessageHandler: (data: FrameMessage) => void;
  private connectionHandler: (connected: boolean) => void;
  private originalWidth: number = 640;
  private originalHeight: number = 360;
  private currentImageWidth: number = 0;
  private currentImageHeight: number = 0;
  private lastRenderedFrameTime: number = 0; // Track the timestamp of the last rendered frame
  private pendingRenderPromise: Promise<void> | null = null; // Track ongoing render operations

  // Playback control properties
  private isPlaying: boolean = true;
  private playbackRate: number = 1.0;
  private currentFrameIndex: number = 0;
  private onPlaybackStateChange: ((isPlaying: boolean) => void) | null = null;
  private onBufferUpdate: ((bufferInfo: { current: number; total: number }) => void) | null = null;
  private startTime: number = 0;
  private pauseTime: number = 0;

  // Add these properties to the RTMPStreamViewer class (near the other private properties)
  private objectUrlsToRevoke: string[] = []; // Track object URLs for cleanup

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;

    if (!this.canvas) {
      throw new Error(`Canvas element with ID "${canvasId}" not found`);
    }

    // Try to get WebGL2 context first, then fall back to WebGL1
    this.gl = this.canvas.getContext('webgl2');
    if (this.gl) {
      this.useWebGL2 = true;
      console.log('Using WebGL2 for rendering');
    } else {
      this.gl = this.canvas.getContext('webgl', {
        alpha: false,
        antialias: false,
        depth: false,
        powerPreference: 'high-performance',
      });
      console.log('Using WebGL1 for rendering');
    }

    if (!this.gl) {
      throw new Error('WebGL is not supported in this browser');
    }

    // Pre-create image for reuse
    this.imageCache = new Image();

    // Get the WebSocket manager instance
    this.wsManager = WebSocketManager.getInstance();

    // Create handlers that we can later remove
    this.binaryMessageHandler = this.handleBinaryMessage.bind(this);
    this.frameMessageHandler = this.handleFrameMessage.bind(this);
    this.connectionHandler = this.handleConnectionChange.bind(this);

    // Initialize the viewer
    this.init();
  }

  // Playback control methods
  public play(): void {
    if (!this.isPlaying) {
      this.isPlaying = true;

      // If we were paused, calculate the new start time to maintain position
      if (this.pauseTime > 0) {
        this.startTime = performance.now() - (this.pauseTime - this.startTime);
        this.pauseTime = 0;
      } else {
        this.startTime = performance.now();
      }

      // If we're at the end of the buffer and connected, switch to live mode
      if (this.currentFrameIndex >= this.frameBuffer.length - 1 && this.connected) {
        // Reset to live playback
        this.startTime = performance.now();
      }

      if (this.onPlaybackStateChange) {
        this.onPlaybackStateChange(true);
      }
    }
  }

  public pause(): void {
    if (this.isPlaying) {
      // Set playing state to false immediately
      this.isPlaying = false;
      this.pauseTime = performance.now();

      // Immediately clear the frame queue to prevent any pending frames from being processed
      this.frameQueue = [];

      // Force a synchronous state update to the UI
      if (this.onPlaybackStateChange) {
        this.onPlaybackStateChange(false);
      }

      // Log that we've paused
      console.log('Video paused at frame index:', this.currentFrameIndex);
    }
  }

  public togglePlayPause(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public setPlaybackRate(rate: number): void {
    this.playbackRate = Math.max(0.25, Math.min(2.0, rate));
  }

  public seekToPosition(position: number): void {
    // position is a value between 0 and 1
    if (position < 0 || position > 1) {
      return;
    }

    if (this.frameBuffer.length === 0) {
      return;
    }

    const frameIndex = Math.floor(position * (this.frameBuffer.length - 1));
    this.currentFrameIndex = frameIndex;

    // If paused, render the frame immediately
    if (!this.isPlaying && this.frameBuffer[frameIndex]) {
      this.renderSpecificFrame(this.frameBuffer[frameIndex]);
    }

    // Update start time to maintain correct playback from this position
    if (this.isPlaying) {
      const frameTime = this.frameBuffer[frameIndex]?.timestamp || 0;
      const currentTime = performance.now();
      this.startTime = currentTime - frameTime;
    }
  }

  public getCurrentPosition(): number {
    if (this.frameBuffer.length === 0) {
      return 0;
    }
    return this.currentFrameIndex / (this.frameBuffer.length - 1);
  }

  public getBufferInfo(): { current: number; total: number } {
    return {
      current: this.currentFrameIndex,
      total: this.frameBuffer.length,
    };
  }

  public setPlaybackStateChangeListener(callback: (isPlaying: boolean) => void): void {
    this.onPlaybackStateChange = callback;
  }

  public setBufferUpdateListener(
    callback: (bufferInfo: { current: number; total: number }) => void
  ): void {
    this.onBufferUpdate = callback;
  }

  private init(): void {
    if (!this.canvas || !this.gl) return;

    // Set initial canvas size
    this.canvas.width = this.originalWidth;
    this.canvas.height = this.originalHeight;

    // Initialize WebGL
    this.initWebGL();

    // Set up WebSocket listeners
    this.setupWebSocketListeners();

    // Ensure WebSocket is connected
    this.wsManager.connect();

    // Start render loop
    this.startRenderLoop();

    // Initialize playback
    this.startTime = performance.now();
  }

  private setupWebSocketListeners(): void {
    // Add listeners for binary messages (video frames)
    this.wsManager.addMessageListener('binary', this.binaryMessageHandler);

    // Add listeners for frame messages (if sent as JSON)
    this.wsManager.addMessageListener('frame', this.frameMessageHandler);

    // Add connection state listener
    this.wsManager.addConnectionListener(this.connectionHandler);
  }

  private handleBinaryMessage(data: ArrayBuffer): void {
    // Try to extract resolution information from the first bytes if available
    // This is a placeholder - actual implementation would depend on your binary format
    const width: number | undefined = undefined;
    const height: number | undefined = undefined;

    const currentTime = performance.now();

    // Create frame buffer item
    const frameItem: FrameBufferItem = {
      blob: new Blob([data], { type: 'image/jpeg' }),
      width,
      height,
      timestamp: currentTime,
    };

    // Add to buffer for seeking first (regardless of play state)
    this.addToFrameBuffer(frameItem);

    // Only add to queue for immediate playback if playing
    // Double-check isPlaying to ensure we respect the current state
    if (this.isPlaying && this.frameQueue.length < this.maxQueueSize) {
      // Only add to queue if it's newer than the last frame in the queue
      if (
        this.frameQueue.length === 0 ||
        currentTime > this.frameQueue[this.frameQueue.length - 1].timestamp
      ) {
        this.frameQueue.push(frameItem);
      } else {
        // Frame is out of order, skip it
        this.frameDropped++;
        console.warn('Dropped out-of-order frame');
      }
    } else {
      this.frameDropped++;
    }
  }

  private handleFrameMessage(message: FrameMessage): void {
    // Handle frame data in hex format
    const frameData = this.hexToBytes(message.data);
    const currentTime = performance.now();

    // Create frame buffer item
    const frameItem: FrameBufferItem = {
      blob: new Blob([frameData], { type: message.format || 'image/jpeg' }),
      width: message.width,
      height: message.height,
      timestamp: currentTime,
    };

    // Add to buffer for seeking first (regardless of play state)
    this.addToFrameBuffer(frameItem);

    // Only add to queue for immediate playback if playing
    // Double-check isPlaying to ensure we respect the current state
    if (this.isPlaying && this.frameQueue.length < this.maxQueueSize) {
      // Only add to queue if it's newer than the last frame in the queue
      if (
        this.frameQueue.length === 0 ||
        currentTime > this.frameQueue[this.frameQueue.length - 1].timestamp
      ) {
        this.frameQueue.push(frameItem);
      } else {
        // Frame is out of order, skip it
        this.frameDropped++;
        console.warn('Dropped out-of-order frame');
      }
    } else {
      this.frameDropped++;
    }
  }

  private addToFrameBuffer(frameItem: FrameBufferItem): void {
    // Only add to frame buffer if it's newer than the last frame
    if (
      this.frameBuffer.length === 0 ||
      frameItem.timestamp > this.frameBuffer[this.frameBuffer.length - 1].timestamp
    ) {
      // Add to frame buffer for seeking
      this.frameBuffer.push(frameItem);

      // Limit buffer size
      if (this.frameBuffer.length > this.maxBufferSize) {
        // Remove oldest frames and revoke their object URLs
        const removedFrames = this.frameBuffer.splice(
          0,
          Math.min(10, this.frameBuffer.length - this.maxBufferSize)
        );
        removedFrames.forEach((frame) => {
          if ((frame as any)._objectUrl) {
            const url = (frame as any)._objectUrl;
            URL.revokeObjectURL(url);
            const index = this.objectUrlsToRevoke.indexOf(url);
            if (index !== -1) {
              this.objectUrlsToRevoke.splice(index, 1);
            }
          }
        });
      }

      // Update current frame index if playing
      if (this.isPlaying) {
        this.currentFrameIndex = this.frameBuffer.length - 1;
      }

      // Notify buffer update
      if (this.onBufferUpdate) {
        this.onBufferUpdate(this.getBufferInfo());
      }
    } else {
      // Frame is out of order, skip it
      console.warn('Dropped out-of-order frame from buffer');
    }
  }

  private handleConnectionChange(connected: boolean): void {
    this.connected = connected;

    if (!connected && this.gl && this.canvas) {
      // Draw disconnected message using a temporary 2D context
      const tempCtx = document.createElement('canvas').getContext('2d');
      if (tempCtx) {
        tempCtx.canvas.width = this.canvas.width;
        tempCtx.canvas.height = this.canvas.height;
        tempCtx.fillStyle = 'black';
        tempCtx.fillRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
        tempCtx.fillStyle = 'red';
        tempCtx.font = '20px Arial';
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillText(
          'Connection lost. Reconnecting...',
          tempCtx.canvas.width / 2,
          tempCtx.canvas.height / 2
        );

        // Upload the canvas with text to WebGL texture
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texImage2D(
          this.gl.TEXTURE_2D,
          0,
          this.gl.RGBA,
          this.gl.RGBA,
          this.gl.UNSIGNED_BYTE,
          tempCtx.canvas
        );

        // Draw the texture
        this.drawTexture();
      }
    }
  }

  private initWebGL(): void {
    if (!this.gl) return;

    // Create shader program
    const vertexShader = this.createShader(
      this.gl.VERTEX_SHADER,
      `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0, 1);
        v_texCoord = a_texCoord;
      }
    `
    );

    const fragmentShader = this.createShader(
      this.gl.FRAGMENT_SHADER,
      `
      precision mediump float;
      uniform sampler2D u_image;
      varying vec2 v_texCoord;
      void main() {
        gl_FragColor = texture2D(u_image, v_texCoord);
      }
    `
    );

    if (!vertexShader || !fragmentShader) {
      throw new Error('Failed to create shaders');
    }

    // Create program
    this.program = this.createProgram(vertexShader, fragmentShader);
    if (!this.program) {
      throw new Error('Failed to create shader program');
    }

    // Create buffers
    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    // Define a rectangle (2 triangles) that covers the entire canvas
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0,
        -1.0, // bottom left
        1.0,
        -1.0, // bottom right
        -1.0,
        1.0, // top left
        1.0,
        1.0, // top right
      ]),
      this.gl.STATIC_DRAW
    );

    this.texCoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    // Define texture coordinates for the rectangle
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([
        0.0,
        1.0, // bottom left
        1.0,
        1.0, // bottom right
        0.0,
        0.0, // top left
        1.0,
        0.0, // top right
      ]),
      this.gl.STATIC_DRAW
    );

    // Create texture
    this.texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

    // Set texture parameters
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

    // Set up initial black texture
    const blackPixel = new Uint8Array([0, 0, 0, 255]);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      1,
      1,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      blackPixel
    );

    // Set viewport and clear color
    this.gl.viewport(0, 0, this.canvas?.width ?? 0, this.canvas?.height ?? 0);
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // Draw "Connecting..." text using a temporary 2D context
    const tempCtx = document.createElement('canvas').getContext('2d');
    if (tempCtx) {
      tempCtx.canvas.width = this.canvas?.width ?? 0;
      tempCtx.canvas.height = this.canvas?.height ?? 0;
      tempCtx.fillStyle = 'black';
      tempCtx.fillRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
      tempCtx.fillStyle = 'white';
      tempCtx.font = '20px Arial';
      tempCtx.textAlign = 'center';
      tempCtx.textBaseline = 'middle';
      tempCtx.fillText(
        'Connecting to stream...',
        tempCtx.canvas.width / 2,
        tempCtx.canvas.height / 2
      );

      // Upload the canvas with text to WebGL texture
      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.gl.RGBA,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        tempCtx.canvas
      );

      // Draw the texture
      this.drawTexture();
    }
  }

  private createShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null;

    const shader = this.gl.createShader(type);
    if (!shader) return null;

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    const success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
    if (!success) {
      console.error('Could not compile shader:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  private createProgram(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ): WebGLProgram | null {
    if (!this.gl) return null;

    const program = this.gl.createProgram();
    if (!program) return null;

    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    const success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
    if (!success) {
      console.error('Could not link program:', this.gl.getProgramInfoLog(program));
      this.gl.deleteProgram(program);
      return null;
    }

    return program;
  }

  private drawTexture(): void {
    if (!this.gl || !this.program) return;

    // Clear the canvas
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // Use our shader program
    this.gl.useProgram(this.program);

    // Set up position attribute
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);

    // Set up texture coordinate attribute
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    const texCoordLocation = this.gl.getAttribLocation(this.program, 'a_texCoord');
    this.gl.enableVertexAttribArray(texCoordLocation);
    this.gl.vertexAttribPointer(texCoordLocation, 2, this.gl.FLOAT, false, 0, 0);

    // Set the texture
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

    // Set the texture uniform
    const imageLocation = this.gl.getUniformLocation(this.program, 'u_image');
    this.gl.uniform1i(imageLocation, 0);

    // Draw the rectangle (2 triangles using TRIANGLE_STRIP)
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }

  private startRenderLoop(): void {
    if (this.isRendering) return;

    this.isRendering = true;
    this.renderFrame();
  }

  private renderFrame = (): void => {
    if (!this.isRendering) return;

    const now = performance.now();
    const elapsed = now - this.lastFrameTimestamp;

    // Target 60fps (16.67ms per frame)
    // Only process frame if enough time has passed or it's the first frame
    if (elapsed >= 16.67 || this.lastFrameTimestamp === 0) {
      this.lastFrameTimestamp = now;

      // Check isPlaying state first before doing any processing
      if (this.isPlaying && !this.pendingRenderPromise) {
        // Only process frames if we're playing and not already rendering
        if (this.frameQueue.length > 0 && this.connected) {
          // Live playback - use frame queue
          this.processNextFrameFromQueue();
        } else if (this.frameBuffer.length > 0) {
          // Playback from buffer
          this.playFromBuffer(now);
        }
      }
    }

    // Continue the render loop
    requestAnimationFrame(this.renderFrame);
  };

  private processNextFrameFromQueue(): void {
    if (!this.gl || !this.canvas || this.frameQueue.length === 0) return;

    const startProcess = performance.now();

    // Sort the queue by timestamp to ensure we're processing frames in order
    this.frameQueue.sort((a, b) => a.timestamp - b.timestamp);

    // Get the next frame (oldest in queue)
    const frame = this.frameQueue.shift()!;

    // Only render if this frame is newer than the last one we rendered
    if (frame.timestamp > this.lastRenderedFrameTime) {
      this.lastRenderedFrameTime = frame.timestamp;
      this.pendingRenderPromise = this.renderSpecificFrame(frame).then(() => {
        this.pendingRenderPromise = null;
      });

      // Update frame count and processing time
      this.frameCount++;
      this.frameProcessingTime += performance.now() - startProcess;
    } else {
      console.warn('Skipped rendering older frame');
    }
  }

  private playFromBuffer(now: number): void {
    if (this.frameBuffer.length === 0) return;

    // Calculate which frame to show based on elapsed time
    const elapsedSinceStart = (now - this.startTime) * this.playbackRate;

    // Find the frame that corresponds to the current time
    let frameIndex = 0;
    const firstFrameTime = this.frameBuffer[0].timestamp;

    for (let i = 0; i < this.frameBuffer.length; i++) {
      const frameTime = this.frameBuffer[i].timestamp - firstFrameTime;
      if (frameTime > elapsedSinceStart) {
        break;
      }
      frameIndex = i;
    }

    // If we've reached the end of the buffer and we're connected, loop back to live
    if (frameIndex >= this.frameBuffer.length - 1 && this.connected) {
      // Reset to live playback
      this.startTime = now;
      frameIndex = this.frameBuffer.length - 1;
    }

    // Only update and render if the frame index has changed
    if (frameIndex !== this.currentFrameIndex) {
      // Update current frame index
      this.currentFrameIndex = frameIndex;

      // Render the frame
      if (this.frameBuffer[frameIndex]) {
        const frame = this.frameBuffer[frameIndex];

        // Only render if this frame is newer than the last one we rendered
        // Exception: when seeking backward, we need to render older frames
        if (frame.timestamp > this.lastRenderedFrameTime || frameIndex < this.currentFrameIndex) {
          this.lastRenderedFrameTime = frame.timestamp;
          this.pendingRenderPromise = this.renderSpecificFrame(frame).then(() => {
            this.pendingRenderPromise = null;
          });
        }
      }

      // Notify buffer update
      if (this.onBufferUpdate) {
        this.onBufferUpdate(this.getBufferInfo());
      }
    }
  }

  private renderSpecificFrame(frame: FrameBufferItem): Promise<void> {
    if (!this.gl || !this.canvas) return Promise.resolve();

    // Check if we already have a URL for this frame to avoid creating duplicate object URLs
    if ((frame as any)._objectUrl) {
      return this.loadAndRenderImage((frame as any)._objectUrl, frame);
    }

    // Create object URL only once per frame and store it
    const url = URL.createObjectURL(frame.blob);
    (frame as any)._objectUrl = url;

    // Add to cleanup list to prevent memory leaks
    this.objectUrlsToRevoke.push(url);

    // Clean up old object URLs if we have too many
    if (this.objectUrlsToRevoke.length > 50) {
      const urlToRevoke = this.objectUrlsToRevoke.shift();
      if (urlToRevoke) {
        URL.revokeObjectURL(urlToRevoke);
      }
    }

    return this.loadAndRenderImage(url, frame);
  }

  // Separate method for loading and rendering the image
  private loadAndRenderImage(url: string, frame: FrameBufferItem): Promise<void> {
    return new Promise<void>((resolve) => {
      // Reuse the image object to reduce garbage collection
      const img = this.imageCache || new Image();

      // Set up error handling before setting src
      img.onerror = () => {
        console.error('Failed to load image');
        resolve(); // Resolve the promise even on error to prevent hanging
      };

      img.onload = () => {
        if (this.gl && this.texture) {
          try {
            // Update current image dimensions
            this.currentImageWidth = img.naturalWidth;
            this.currentImageHeight = img.naturalHeight;

            // If we have explicit dimensions from the frame and they differ from the image's natural dimensions,
            // we might need to resize the canvas or adjust rendering
            if (
              frame.width &&
              frame.height &&
              (frame.width !== img.naturalWidth || frame.height !== img.naturalHeight)
            ) {
              // Use the explicit dimensions if they're larger than what we detected
              if (frame.width > this.currentImageWidth) this.currentImageWidth = frame.width;
              if (frame.height > this.currentImageHeight) this.currentImageHeight = frame.height;
            }

            // Resize canvas if needed to match image aspect ratio while maintaining fit
            this.updateCanvasSize();

            // Bind the texture
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

            // Upload the image to the texture
            this.gl.texImage2D(
              this.gl.TEXTURE_2D,
              0,
              this.gl.RGBA,
              this.gl.RGBA,
              this.gl.UNSIGNED_BYTE,
              img
            );

            // Draw the texture
            this.drawTexture();
          } catch (error) {
            console.error('Error rendering frame:', error);
          }
        }

        // Don't revoke the URL here since we're caching it with the frame
        resolve();
      };

      // Set the source last to start loading
      img.src = url;
      this.imageCache = img;
    });
  }

  // Helper function to convert hex string to byte array
  private hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
  }

  // Update canvas size to match image aspect ratio
  private updateCanvasSize(): void {
    if (!this.canvas || !this.gl || this.currentImageWidth <= 0 || this.currentImageHeight <= 0)
      return;

    const containerWidth = this.canvas.parentElement?.clientWidth || this.originalWidth;
    const containerHeight = this.canvas.parentElement?.clientHeight || this.originalHeight;

    // Calculate the aspect ratio
    const imageAspectRatio = this.currentImageWidth / this.currentImageHeight;
    const containerAspectRatio = containerWidth / containerHeight;

    let newWidth, newHeight;

    if (imageAspectRatio > containerAspectRatio) {
      // Image is wider than container (relative to height)
      newWidth = containerWidth;
      newHeight = containerWidth / imageAspectRatio;
    } else {
      // Image is taller than container (relative to width)
      newHeight = containerHeight;
      newWidth = containerHeight * imageAspectRatio;
    }

    // Only resize if dimensions have changed significantly
    if (
      Math.abs(this.canvas.width - newWidth) > 5 ||
      Math.abs(this.canvas.height - newHeight) > 5
    ) {
      this.resize(newWidth, newHeight);
    }
  }

  // Resize the canvas
  public resize(width: number, height: number): void {
    if (this.canvas && this.gl) {
      // Round to prevent blurry rendering from fractional pixels
      this.canvas.width = Math.round(width);
      this.canvas.height = Math.round(height);
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  // Clean up resources
  public destroy(): void {
    this.isRendering = false;
    this.isPlaying = false;

    // Remove WebSocket listeners
    this.wsManager.removeMessageListener('binary', this.binaryMessageHandler);
    this.wsManager.removeMessageListener('frame', this.frameMessageHandler);
    this.wsManager.removeConnectionListener(this.connectionHandler);

    // Clear image cache
    if (this.imageCache) {
      this.imageCache.onload = null;
      this.imageCache.src = '';
    }

    // Revoke all object URLs to prevent memory leaks
    this.objectUrlsToRevoke.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    this.objectUrlsToRevoke = [];

    // Clear frame queue and buffer
    this.frameQueue = [];
    this.frameBuffer = [];

    // Delete WebGL resources
    if (this.gl) {
      // Delete buffers
      if (this.positionBuffer) this.gl.deleteBuffer(this.positionBuffer);
      if (this.texCoordBuffer) this.gl.deleteBuffer(this.texCoordBuffer);

      // Delete texture
      if (this.texture) this.gl.deleteTexture(this.texture);

      // Delete program and shaders
      if (this.program) {
        // Get attached shaders
        const shaders = this.gl.getAttachedShaders(this.program);
        if (shaders) {
          // Delete each shader
          shaders.forEach((shader) => {
            this.gl?.deleteShader(shader);
          });
        }

        // Delete program
        this.gl.deleteProgram(this.program);
      }
    }

    // Clear references
    this.connected = false;
    this.canvas = null;
    this.gl = null;
    this.program = null;
    this.texture = null;
    this.positionBuffer = null;
    this.texCoordBuffer = null;
    this.onPlaybackStateChange = null;
    this.onBufferUpdate = null;
  }
}
