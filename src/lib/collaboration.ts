import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";
import { CollaborationExtension } from "@tiptap/extension-collaboration";
import { CollaborationCursorExtension } from "@tiptap/extension-collaboration-cursor";

// Function to get a unique color for a user
export function getRandomColor(): string {
  // List of bright, distinguishable colors
  const colors = [
    "#ff0000", // red
    "#00ff00", // green
    "#0000ff", // blue
    "#ff00ff", // magenta
    "#00ffff", // cyan
    "#ffff00", // yellow
    "#ff8000", // orange
    "#8000ff", // purple
    "#0080ff", // light blue
    "#ff0080", // pink
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Initialize the collaboration providers
export function initCollaboration(
  documentId: string,
  userName: string,
  userColor?: string,
) {
  // Create a Yjs document
  const ydoc = new Y.Doc();

  // Connect to peers through WebRTC
  const webrtcProvider = new WebrtcProvider(`documaker-${documentId}`, ydoc, {
    signaling: ["wss://signaling.y-webrtc.dev"],
    password: documentId, // Room password
    awareness: {
      clientID: Math.floor(Math.random() * 100000),
      user: {
        name: userName,
        color: userColor || getRandomColor(),
      },
    },
  });

  // Save document locally with IndexedDB
  const indexeddbProvider = new IndexeddbPersistence(
    `documaker-${documentId}`,
    ydoc,
  );

  // Get the shared type for our content
  const yXmlFragment = ydoc.get("content", Y.XmlFragment);

  // Get the collaboration extensions for TipTap
  const collaborationExtension = CollaborationExtension.configure({
    document: ydoc,
    field: "content",
  });

  const collaborationCursorExtension = CollaborationCursorExtension.configure({
    provider: webrtcProvider,
    user: {
      name: userName,
      color: userColor || getRandomColor(),
    },
  });

  return {
    ydoc,
    webrtcProvider,
    indexeddbProvider,
    yXmlFragment,
    collaborationExtension,
    collaborationCursorExtension,
  };
}

// Cleanup function
export function cleanupCollaboration(
  webrtcProvider: WebrtcProvider,
  indexeddbProvider: IndexeddbPersistence,
  ydoc: Y.Doc,
) {
  webrtcProvider.disconnect();
  indexeddbProvider.destroy();
  ydoc.destroy();
}

// Get current users connected
export function getConnectedUsers(webrtcProvider: WebrtcProvider) {
  const users: { clientId: number; name: string; color: string }[] = [];

  webrtcProvider.awareness.getStates().forEach((state, clientId) => {
    if (state.user) {
      users.push({
        clientId,
        name: state.user.name,
        color: state.user.color,
      });
    }
  });

  return users;
}

// Listen for user connection/disconnection events
export function listenToConnectionEvents(
  webrtcProvider: WebrtcProvider,
  onChangeCallback: (
    users: { clientId: number; name: string; color: string }[],
  ) => void,
) {
  const updateCallback = () => {
    const users = getConnectedUsers(webrtcProvider);
    onChangeCallback(users);
  };

  webrtcProvider.awareness.on("change", updateCallback);

  return () => {
    webrtcProvider.awareness.off("change", updateCallback);
  };
}
