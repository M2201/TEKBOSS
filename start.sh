#!/bin/bash
# Tek Boss — Start Both Servers
# Run this once: chmod +x start.sh
# Then anytime: ./start.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "🧠 Starting Tek Boss Blueprint..."
echo ""

# Kill anything already on these ports
lsof -ti:3005 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
sleep 1

# Re-install native modules (prevents iCloud Drive eviction crash on restart)
echo "  🔧 Refreshing native modules..."
cd "$SCRIPT_DIR/server" && npm install --silent 2>/dev/null

# Start backend in background, log to /tmp/tekboss-server.log
cd "$SCRIPT_DIR/server"
npm run dev > /tmp/tekboss-server.log 2>&1 &
SERVER_PID=$!

# Wait for backend to come up
sleep 3

# Start frontend in background, log to /tmp/tekboss-client.log
cd "$SCRIPT_DIR"
npm run dev > /tmp/tekboss-client.log 2>&1 &
CLIENT_PID=$!

sleep 4

echo "  ✅ Backend  → http://localhost:3005  (pid $SERVER_PID)"
echo "  ✅ Frontend → http://localhost:5173  (pid $CLIENT_PID)"
echo ""
echo "  Logs: tail -f /tmp/tekboss-server.log"
echo "        tail -f /tmp/tekboss-client.log"
echo ""
echo "  To stop: kill $SERVER_PID $CLIENT_PID"
echo "  Or run:  pkill -f 'node --watch index.js'; pkill -f vite"
echo ""

# Keep script alive so Ctrl+C stops everything cleanly
wait $SERVER_PID $CLIENT_PID
