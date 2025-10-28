import React, { useEffect, useRef, useState } from "react";
import * as ActionCable from "@rails/actioncable";

export default function Chat({
  cableUrl = "ws://localhost:3001/cable",
  channel = "ChatroomChannel",
  room = "public",
  username = "Guest",
}) {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const consumerRef = useRef(null);
  const subscriptionRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const consumer = ActionCable.createConsumer(cableUrl);
    consumerRef.current = consumer;

    const subscription = consumer.subscriptions.create(
      { channel, room },
      {
        connected() {
          setConnected(true);
        },
        disconnected() {
          setConnected(false);
        },
        received(data) {
          setMessages((prev) => [...prev, data.message ?? data]);
          requestAnimationFrame(() => {
            listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
          });
        },
      }
    );

    subscriptionRef.current = subscription;

    return () => {
      try {
        if (subscriptionRef.current) {
          consumer.subscriptions.remove(subscriptionRef.current);
        }
        consumer.disconnect();
      } catch {}
    };
  }, [cableUrl, channel, room]);

  function sendMessage(e) {
    e?.preventDefault();
    if (!text.trim()) return;
    subscriptionRef.current.perform("speak", {
        action: "speak",
        user: username,
        content: text.trim(),
    });
    setText("");
  }

  return (
    <div className="container mx-auto">
      <div className="min-w-full border rounded">
        <div className="hidden lg:block">
          <div className="w-full">
            <div className="relative flex items-center p-3 border-b border-gray-300">
              <span className="block ml-2 font-bold text-gray-600">Chatroom: General ({connected ? "online" : "offline"})</span>
            </div>
            <div ref={listRef} className="relative w-full p-6 overflow-y-auto h-[40rem]">
              <ul className="space-y-2">
                {messages.map((m) => (
                  <li key={m.id ?? Math.random()} className="flex justify-start">
                    <div className="relative max-w-xl px-4 py-2 text-gray-700 rounded shadow bg-white">
                      <span className="block">
                        <strong>{m.user || m.message?.user}</strong> {m.content || m.message?.content}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <form onSubmit={sendMessage} className="flex items-center justify-between w-full p-3 border-t border-gray-300">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Message"
                className="block w-full py-2 pl-4 mx-3 bg-gray-100 rounded-full outline-none focus:text-gray-700"
                required
              />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
