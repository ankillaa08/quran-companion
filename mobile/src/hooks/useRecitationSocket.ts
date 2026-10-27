/**
 * Custom Hook for Recitation WebSocket Management
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { RecitationWebSocket } from "../services/websocket";
import { useRecitationStore } from "../store/useRecitationStore";

export function useRecitationSocket(sessionId: string | null) {
  const socketRef = useRef<RecitationWebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const {
    setConnectionStatus,
    updateAlignment,
    setRecentTranscript,
    addMistake,
    advanceAyah,
  } = useRecitationStore();

  const connect = useCallback(async () => {
    if (!sessionId) return;
    setConnectionStatus("connecting");

    const socket = new RecitationWebSocket(sessionId);
    socketRef.current = socket;

    socket.on("open", () => {
      setIsConnected(true);
      setConnectionStatus("connected");
    });

    socket.on("partial_transcript", (data) => {
      setRecentTranscript(data.text);
    });

    socket.on("word_alignment", (data) => {
      updateAlignment(data);
    });

    socket.on("possible_mistake", (data) => {
      addMistake(data);
    });

    socket.on("close", () => {
      setIsConnected(false);
      setConnectionStatus("disconnected");
    });

    socket.on("error", () => {
      setIsConnected(false);
      setConnectionStatus("error");
    });

    try {
      await socket.connect();
    } catch {
      setConnectionStatus("error");
    }
  }, [sessionId, setConnectionStatus, updateAlignment, setRecentTranscript, addMistake]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setConnectionStatus("disconnected");
    }
  }, [setConnectionStatus]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect,
  };
}
