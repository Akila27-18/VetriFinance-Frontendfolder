// frontend/src/hooks/useWebSocket.js
import { useEffect, useRef, useState, useCallback } from "react";

export function useWebSocket(url) {
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);
  const heartbeatRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);

  const connect = useCallback(() => {
    if (!url) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected:", url);
      setConnected(true);

      // Clear reconnect timer
      if (reconnectRef.current) clearTimeout(reconnectRef.current);

      // Start heartbeat (ping every 25s)
      heartbeatRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "ping" }));
      }, 25000);
    };

    ws.onmessage = (ev) => {
      let data;
      try {
        data = JSON.parse(ev.data);
      } catch (e) {
        console.error("Invalid WS JSON:", e);
        return;
      }

      if (data.type === "pong") return; // ignore pongs

      setMessages((prev) => [...prev, data]);
    };

    ws.onclose = () => {
      console.log("WS disconnected");

      setConnected(false);

      // Stop heartbeat
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);

      // Reconnect only if it wasn't manually closed
      reconnectRef.current = setTimeout(() => {
        console.log("Reconnecting WebSocket...");
        connect();
      }, 1500);
    };

    ws.onerror = (err) => {
      console.error("WS Error:", err);
      ws.close();
    };
  }, [url]);

  // Initial connect
  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        console.log("Cleaning up WebSocket");
        wsRef.current.onclose = null; // prevent reconnection
        wsRef.current.close();
      }
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [connect]);

  const sendMessage = useCallback((msg) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn("WS not connected, cannot send:", msg);
      return;
    }
    wsRef.current.send(JSON.stringify(msg));
  }, []);

  return { messages, sendMessage, connected };
}
