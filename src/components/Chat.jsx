import React, { useEffect, useRef, useState } from "react";
import * as ActionCable from "@rails/actioncable";

export default function Chat({
  cableUrl = "ws://localhost:3001/cable",
  channel = "ChatroomChannel",
  room = "public"
}) {
  const [userlocal, setUserlocal] = useState(localStorage.getItem("userlocal") || "");
  const [tempUserlocal, setTempUserlocal] = useState("");
  const [showUserlocalModal, setShowUserlocalModal] = useState(!localStorage.getItem("userlocal"));
  const [readyToConnect, setReadyToConnect] = useState(!!localStorage.getItem("userlocal"));

  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const consumerRef = useRef(null);
  const subscriptionRef = useRef(null);
  const listRef = useRef(null);

  // Stream
  useEffect(() => {
    if (!readyToConnect) return;

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
            listRef.current?.scrollTo({
              top: listRef.current.scrollHeight,
              behavior: "smooth"
            });
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
  }, [cableUrl, channel, room, readyToConnect]);

  // Send message
  function sendMessage(e) {
    e?.preventDefault();
    if (!text.trim()) return;
    if (!subscriptionRef.current) return;

    subscriptionRef.current.perform("speak", {
      user: userlocal,
      content: text.trim()
    });
    setText("");
  }

  // Store user
  function saveUserlocal(e) {
    e.preventDefault();
    if (!tempUserlocal.trim()) return;
    const trimmed = tempUserlocal.trim();
    localStorage.setItem("userlocal", trimmed);
    setUserlocal(trimmed);
    setShowUserlocalModal(false);
    setReadyToConnect(true);
  }

  return (
    <div className="container mx-auto relative">

      {showUserlocalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded p-6 w-80 shadow">
            <h2 className="text-lg font-bold mb-4">Masukkan Username</h2>
            <form onSubmit={saveUserlocal}>
              <input
                type="text"
                className="border border-gray-300 rounded px-3 py-2 w-full mb-4"
                placeholder="Username..."
                value={tempUserlocal}
                onChange={(e) => setTempUserlocal(e.target.value)}
                autoFocus
              />
              <button
                type="submit"
                className="w-full bg-blue-500 text-white px-4 py-2 rounded"
              >
                Simpan
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="min-w-full border rounded">
        <div className="lg:block">
          <div className="w-full">
            <div className="relative flex items-center p-3 border-b border-gray-300">
              <span className="block ml-2 font-bold text-gray-600">
                Chatroom: General ({connected ? "online" : "offline"})
              </span>
            </div>

            <div
              ref={listRef}
              className="relative w-full p-6 overflow-y-auto h-[40rem] bg-gray-50"
            >
              <ul className="space-y-2">
                {messages.map((m, idx) => (
                  <li key={idx} className="flex justify-start">
                    <div className="relative max-w-xl px-4 py-2 text-gray-700 rounded shadow bg-white">
                      <span className="block">
                        <strong>{m.user || m.message?.user}</strong> {m.content || m.message?.content}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <form
              onSubmit={sendMessage}
              className="flex items-center justify-between w-full p-3 border-t border-gray-300"
            >
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Message"
                className="block w-full py-2 pl-4 mx-3 bg-gray-100 rounded-full outline-none focus:text-gray-700"
                required
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Send
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
