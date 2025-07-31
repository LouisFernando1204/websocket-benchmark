package main

import (
	"context"
	"encoding/csv"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"sync"
	"sync/atomic"
	"time"

	"github.com/coder/websocket"
)

var clients = make(map[*websocket.Conn]bool)
var broadcastChan = make(chan []byte)
var mutex = &sync.Mutex{}

var echoMessageCounter uint64 = 0

func echoHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		InsecureSkipVerify: true,
	})
	if err != nil {
		log.Println("Accept error:", err)
		return
	}
	defer conn.Close(websocket.StatusNormalClosure, "Connection closed normally")
	log.Println("✅ Client connected (Echo Mode)")

	for {
		messageType, data, err := conn.Read(r.Context())
		if err != nil {
			log.Println("Read error, client likely disconnected:", err)
			log.Println("❌ Client disconnected")
			break
		}
		log.Printf("📥 Received message: %s", data)
		atomic.AddUint64(&echoMessageCounter, 1)
		err = conn.Write(r.Context(), messageType, data)
		if err != nil {
			log.Println("Write error:", err)
			break
		}
		log.Printf("📤 Echoed message: %s", data)
	}
}

func broadcastHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		InsecureSkipVerify: true,
	})
	if err != nil {
		log.Println("Accept error:", err)
		return
	}
	defer conn.Close(websocket.StatusNormalClosure, "Connection closed normally")

	mutex.Lock()
	clients[conn] = true
	mutex.Unlock()
	log.Printf("✅ Client connected (Broadcast Mode). Total clients: %d", len(clients))

	for {
		_, msg, err := conn.Read(r.Context())
		if err != nil {
			mutex.Lock()
			delete(clients, conn)
			mutex.Unlock()
			log.Printf("❌ Client disconnected. Total clients: %d", len(clients))
			break
		}
		broadcastChan <- msg
	}
}

func handleBroadcastMessages() {
	for {
		msg := <-broadcastChan
		mutex.Lock()
		for client := range clients {
			err := client.Write(context.Background(), websocket.MessageText, msg)
			if err != nil {
				log.Printf("Write error: %v", err)
				client.Close(websocket.StatusInternalError, "")
				delete(clients, client)
			}
		}
		mutex.Unlock()
	}
}

func main() {
	serverMode := flag.String("mode", "echo", "Server mode: 'echo' or 'broadcast'")
	flag.Parse() 

	port := "8083" 

	if *serverMode == "broadcast" {
		log.Println("Starting server in BROADCAST mode...")
		http.HandleFunc("/ws", broadcastHandler)
		go handleBroadcastMessages()
		log.Printf("🚀 Golang Websocket Server (Coder) - Broadcast is running on ws://localhost:%s/ws", port)
	} else {
		log.Println("Starting server in ECHO mode...")
		args := flag.Args()
		if len(args) < 2 {
			log.Fatal("Error: Echo mode requires arguments.\nExample: go run main.go -mode=echo golang-coder 100")
		}
		serverId := args[0]
		clientLoad := args[1]
		throughputCsvPath := fmt.Sprintf("throughput_%s_%sclients.csv", serverId, clientLoad)

		file, err := os.Create(throughputCsvPath)
		if err != nil {
			log.Fatalf("Failed to create CSV file: %s", err)
		}
		defer file.Close()

		csvWriter := csv.NewWriter(file)
		defer csvWriter.Flush()
		header := []string{"TIMESTAMP", "THROUGHPUT_MSGS_PER_SEC"}
		csvWriter.Write(header)

		ticker := time.NewTicker(1 * time.Second)
		go func() {
			for t := range ticker.C {
				count := atomic.SwapUint64(&echoMessageCounter, 0)
				log.Printf("Throughput: %d msg/s\n", count)
				timestamp := t.Format(time.RFC3339)
				record := []string{timestamp, strconv.FormatUint(count, 10)}
				csvWriter.Write(record)
				csvWriter.Flush()
			}
		}()

		http.HandleFunc("/ws", echoHandler)
		log.Printf("🚀 Golang Websocket Server (Coder) - Echo is running on ws://localhost:%s/ws", port)
		log.Printf("📝 Logging throughput to file %s", throughputCsvPath)
	}

	err := http.ListenAndServe(":"+port, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}