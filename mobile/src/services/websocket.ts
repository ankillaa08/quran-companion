/**
 * Real-Time WebSocket Streaming Client for Live Recitation
 */
import { WS_BASE_URL } from "./api";

export type WebSocketEventHandler = (event: any) => void;

export class RecitationWebSocket {
  private socket: WebSocket | null = null;
  private sessionId: string;
  private url: string;
  private isExplicitlyClosed: boolean = false;
  private heartbeatInterval: any = null;
  private listeners: Map<string, Set<WebSocketEventHandler>> = new Map();

  constructor(sessionId: string, customBaseUrl?: string) {
    this.sessionId = sessionId;
    const base = customBaseUrl || WS_BASE_URL;
    this.url = `${base}/${sessionId}`;
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.isExplicitlyClosed = false;
      try {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
          this.startHeartbeat();
          this.emit("open", { sessionId: this.sessionId });
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const msgType = data.type || "message";
            this.emit(msgType, data);
            this.emit("any", data);
          } catch (e) {
            console.error("Failed to parse websocket message", e);
          }
        };

        this.socket.onerror = (err) => {
          this.emit("error", err);
          reject(err);
        };

        this.socket.onclose = (event) => {
          this.stopHeartbeat();
          this.emit("close", event);
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  public on(eventType: string, handler: WebSocketEventHandler): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(handler);

    return () => {
      this.listeners.get(eventType)?.delete(handler);
    };
  }

  private emit(eventType: string, payload: any) {
    const handlers = this.listeners.get(eventType);
    if (handlers) {
      handlers.forEach((h) => h(payload));
    }
  }

  public startSession(surahNumber: number, ayahStart: number, ayahEnd: number, mode: "recite" | "memorize" = "recite") {
    this.send({
      type: "start_session",
      surah_number: surahNumber,
      ayah_start: ayahStart,
      ayah_end: ayahEnd,
      mode,
    });
  }

  public sendAudioChunk(base64Data: string, sequence: number) {
    this.send({
      type: "audio_chunk",
      sequence,
      data: base64Data,
    });
  }

  public sendBinaryAudio(data: ArrayBuffer | Uint8Array) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(data);
    }
  }

  public pauseSession() {
    this.send({ type: "pause_session" });
  }

  public resumeSession() {
    this.send({ type: "resume_session" });
  }

  public stopSession() {
    this.send({ type: "stop_session" });
  }

  public send(payload: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: "heartbeat", timestamp: Date.now() }));
      }
    }, 5000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  public disconnect() {
    this.isExplicitlyClosed = true;
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.listeners.clear();
  }
}
