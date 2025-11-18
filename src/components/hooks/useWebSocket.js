// frontend/src/hooks/useWebSocket.js
import { useEffect, useRef, useState } from "react";

export function useWebSocket(url) {
  const wsRef = useRef(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
    // eslint-disable-next-line
  }, [url]);

  function connect() {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => console.log("WebSocket connected");

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setMessages((prev) => [...prev, msg]);
      } catch {
        console.error("Failed to parse WS message");
      }
    };

    ws.onclose = () => {
      console.log("WS closed. Reconnecting...");
      setTimeout(connect, 1500);
    };

    ws.onerror = (err) => {
      console.error("WS error", err);
      ws.close();
    };
  }

  function sendMessage(msg) {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    } else {
      // Optionally: buffer messages or show error
      console.warn("WS not connected");
    }
  }

  return { messages, sendMessage };
}
