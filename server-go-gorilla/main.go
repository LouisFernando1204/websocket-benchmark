package main

import (
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

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var echoMessageCounter uint64 = 0

func echoHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}
	defer conn.Close()
	log.Println("✅ Client connected (Echo Mode)")

	for {
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			log.Println("Read error:", err)
			log.Println("❌ Client disconnected")
			break
		}
		log.Printf("📥 Received message: %s", message)
		atomic.AddUint64(&echoMessageCounter, 1)
		err = conn.WriteMessage(messageType, message)
		if err != nil {
			log.Println("Write error:", err)
			break
		}
		log.Printf("📤 Echoed message: %s", message)
	}
}

var clients = make(map[*websocket.Conn]bool)
var broadcast = make(chan []byte)
var mutex = &sync.Mutex{}

func broadcastHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}
	defer conn.Close()

	mutex.Lock()
	clients[conn] = true
	mutex.Unlock()
	log.Printf("✅ Client connected (Broadcast Mode). Total clients: %d", len(clients))

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			mutex.Lock()
			delete(clients, conn)
			mutex.Unlock()
			log.Printf("❌ Client disconnected. Total clients: %d", len(clients))
			break
		}
		broadcast <- msg
	}
}

func handleBroadcastMessages() {
	for {
		msg := <-broadcast
		mutex.Lock()
		for client := range clients {
			err := client.WriteMessage(websocket.TextMessage, msg)
			if err != nil {
				client.Close()
				delete(clients, client)
			}
		}
		mutex.Unlock()
	}
}

func main() {
	serverMode := flag.String("mode", "echo", "Server mode: 'echo' or 'broadcast'")
	flag.Parse() 

	port := "8082"

	if *serverMode == "broadcast" {
		log.Println("Starting server in BROADCAST mode...")
		http.HandleFunc("/ws", broadcastHandler)
		go handleBroadcastMessages()
		log.Printf("🚀 Golang Websocket Server (Gorilla) - Broadcast is running on ws://localhost:%s/ws", port)
	} else {
		log.Println("Starting server in ECHO mode...")
		args := flag.Args()
		if len(args) < 2 {
			log.Fatal("Error: Echo mode requires arguments.\nExample: go run main.go -mode=echo golang-gorilla 100")
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
		log.Printf("🚀 Golang Websocket Server (Gorilla) - Echo is running on ws://localhost:%s/ws", port)
    	log.Printf("📝 Logging throughput to file %s", throughputCsvPath) 
	}

	err := http.ListenAndServe(":"+port, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}