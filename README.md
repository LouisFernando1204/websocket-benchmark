# WebSocket Benchmark 🚀📊

## ✨ Overview

Welcome to **WebSocket Benchmark**, a comprehensive performance testing and analysis suite designed to evaluate and compare different WebSocket server implementations across various programming languages and libraries. This project provides rigorous benchmarking capabilities for WebSocket servers, measuring critical performance metrics like throughput, latency, connection times, and broadcast efficiency under different load conditions.

The suite tests four different WebSocket server implementations using two distinct test scenarios (Echo and Broadcast tests) with varying client loads from 100 to 1000 concurrent connections, providing detailed performance insights for making informed technology decisions.

## 🔋 Key Features

- 🏗️ **Multi-Language Server Testing** — Comprehensive testing of WebSocket servers across different technologies:

  - **Go with Coder WebSocket library** — High-performance Go implementation using the modern Coder WebSocket library
  - **Go with Gorilla WebSocket** — Traditional Go implementation using the popular Gorilla WebSocket toolkit
  - **Node.js with Socket.IO** — Feature-rich Node.js implementation with Socket.IO's enhanced WebSocket capabilities
  - **Node.js with ws library** — Lightweight Node.js implementation using the native ws WebSocket library

- 📊 **Comprehensive Performance Metrics** — Measures multiple critical performance indicators:

  - **Round Trip Time (RTT)** — Measures message latency for echo operations
  - **Connection Time** — Tracks the time required to establish WebSocket connections
  - **Throughput** — Calculates messages processed per second under load
  - **Broadcast Latency** — Measures message propagation time in broadcast scenarios

- 🧪 **Dual Testing Scenarios** — Two distinct test patterns for comprehensive evaluation:

  - **Echo Test** — Point-to-point communication testing where servers echo back received messages
  - **Broadcast Test** — One-to-many communication testing where one client sends messages broadcast to all connected clients

- 📈 **Scalable Load Testing** — Tests server performance under various load conditions:

  - Concurrent client loads: 100, 200, 400, 600, 800, and 1000 connections
  - Configurable test duration and message intervals
  - Real-time performance monitoring and logging

- 📊 **Advanced Data Analysis** — Jupyter notebooks for comprehensive performance analysis:

  - Statistical analysis of performance metrics
  - Comparative visualizations across different server implementations
  - Performance trend analysis under increasing load conditions
  - Professional charts and graphs for presentation-ready results

- 🔄 **Automated Client Simulation** — Sophisticated client simulator with:

  - Support for multiple WebSocket protocols (native WebSocket, Socket.IO)
  - Concurrent connection management
  - Real-time CSV data logging
  - Configurable test parameters and scenarios

- 📁 **Structured Data Collection** — Organized data storage and management:
  - CSV output for all performance metrics
  - Timestamped data for temporal analysis
  - Categorized data by server type and client load
  - Ready-to-analyze datasets for further research

## 🧑‍💻 How It Works

1. **Test Environment Setup** — Each WebSocket server implementation is configured and started on different ports with specific test modes (echo or broadcast).

2. **Client Simulation Initialization** — The client simulator creates multiple concurrent WebSocket connections to the target server based on the specified load configuration.

3. **Echo Test Execution** — For echo tests:

   - Each client sends periodic messages to the server
   - Server immediately echoes the message back to the sender
   - RTT and throughput metrics are measured and logged in real-time

4. **Broadcast Test Execution** — For broadcast tests:

   - One designated client sends messages at regular intervals
   - Server broadcasts these messages to all connected clients
   - Broadcast latency is measured from send time to receive time across all clients

5. **Real-time Monitoring** — During test execution:

   - Servers log throughput metrics every second
   - Clients record connection times, RTT, and broadcast latencies
   - All data is continuously written to CSV files for analysis

6. **Data Analysis and Visualization** — After test completion:
   - Jupyter notebooks process the collected CSV data
   - Statistical analysis generates performance insights
   - Comparative charts visualize performance differences
   - Results are saved as publication-ready visualizations

## ⚙️ Tech Stack

### Server Implementations

- 🐹 **Go 1.23.4** with:
  - **Coder WebSocket Library** (`github.com/coder/websocket`)
  - **Gorilla WebSocket** (`github.com/gorilla/websocket`)
- 🟢 **Node.js** with:
  - **Socket.IO** (`socket.io ^4.8.1`)
  - **ws Library** (`ws ^8.18.3`)

### Client Simulation

- 🟢 **Node.js** with multiple WebSocket clients:
  - **websocket** (`websocket ^1.0.35`)
  - **socket.io-client** (`socket.io-client ^4.8.1`)
  - **ws** (`ws ^8.18.3`)
  - **csv-writer** (`csv-writer ^1.6.0`)

### Data Analysis

- 🐍 **Python 3.x** with:
  - **pandas** — Data manipulation and analysis
  - **matplotlib** — Statistical visualization
  - **seaborn** — Advanced statistical graphics
  - **Jupyter Notebook** — Interactive analysis environment

## 📚 Insights

- 🌐 **Code** : [View Code](https://github.com/LouisFernando1204/websocket-benchmark)
- 📄 **Published Research Paper** : [Read Journal Article](https://jurnal.polgan.ac.id/index.php/sinkron/article/view/15266)

## 🚀 Getting Started

Follow these steps to set up and run the WebSocket benchmark suite on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 16 or higher)
- [Go](https://golang.org/dl/) (version 1.23 or higher)
- [Python](https://www.python.org/downloads/) (version 3.8 or higher)
- [Jupyter Notebook](https://jupyter.org/install) for data analysis

### Installation & Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/LouisFernando1204/websocket-benchmark.git
   cd websocket-benchmark
   ```

2. **Set up Node.js dependencies:**

   ```bash
   # Install client simulator dependencies
   cd client-simulator
   npm install
   cd ..

   # Install Node.js server dependencies
   cd server-node-socketio
   npm install
   cd ../server-node-ws
   npm install
   cd ..
   ```

3. **Set up Go dependencies:**

   ```bash
   # Install Go Coder server dependencies
   cd server-go-coder
   go mod tidy
   cd ..

   # Install Go Gorilla server dependencies
   cd server-go-gorilla
   go mod tidy
   cd ..
   ```

4. **Set up Python analysis environment:**

   ```bash
   # Create virtual environment (recommended)
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate

   # Install required packages
   pip install pandas matplotlib seaborn jupyter
   ```

### Running the Benchmarks

#### Echo Test Benchmark

1. **Start a WebSocket server** (choose one):

   ```bash
   # Node.js with ws library
   cd server-node-ws
   node echo-test_index.js nodejs-ws 100

   # Node.js with Socket.IO
   cd server-node-socketio
   node echo-test_index.js nodejs-socketio 100

   # Go with Gorilla WebSocket
   cd server-go-gorilla
   go run main.go -mode=echo golang-gorilla 100

   # Go with Coder WebSocket
   cd server-go-coder
   go run main.go -mode=echo golang-coder 100
   ```

2. **Run the client simulator** (in a separate terminal):

   ```bash
   cd client-simulator
   # Configure the target server in echo-test_client-simulator.js
   node echo-test_client-simulator.js
   ```

#### Broadcast Test Benchmark

1. **Start a WebSocket server in broadcast mode**:

   ```bash
   # Node.js with Socket.IO
   cd server-node-socketio
   node broadcast-test_index.js

   # Go with Gorilla WebSocket
   cd server-go-gorilla
   go run main.go -mode=broadcast

   # Go with Coder WebSocket
   cd server-go-coder
   go run main.go -mode=broadcast
   ```

2. **Run the broadcast client simulator**:

   ```bash
   cd client-simulator
   # Configure the target server in broadcast-test_client-simulator.js
   node broadcast-test_client-simulator.js
   ```

### Data Analysis

1. **Start Jupyter Notebook**:

   ```bash
   cd analysis
   jupyter notebook
   ```

2. **Open and run analysis notebooks**:

   - `echo-test_analysis.ipynb` — Analyzes RTT, connection time, and throughput data
   - `broadcast-test_analysis.ipynb` — Analyzes broadcast latency performance

3. **View generated visualizations**:
   - Charts are automatically saved as PNG files in the analysis directory
   - Results include comparative performance graphs across all server implementations

## 📊 Benchmark Configuration

### Server Ports

- **Node.js (ws)**: `8080`
- **Node.js (Socket.IO)**: `8081`
- **Go (Gorilla)**: `8082`
- **Go (Coder)**: `8083`

### Test Parameters

- **Client Loads**: 100, 200, 400, 600, 800, 1000 concurrent connections
- **Test Duration**: 60 seconds (configurable)
- **Echo Test**: Continuous ping-pong messaging
- **Broadcast Test**: Message interval of 3 seconds

### Measured Metrics

- **RTT (Round Trip Time)**: Milliseconds for echo response
- **Connection Time**: Milliseconds to establish WebSocket connection
- **Throughput**: Messages per second processed by server
- **Broadcast Latency**: Milliseconds for message propagation to all clients

## 📈 Performance Analysis Features

- **Statistical Analysis**: Mean, median, percentiles for all metrics
- **Comparative Visualization**: Side-by-side performance comparisons
- **Load Scaling Analysis**: Performance behavior under increasing load
- **Technology Recommendations**: Data-driven insights for WebSocket technology selection

## 🤝 Contributor

- 🧑‍💻 **Louis Fernando** : [@LouisFernando1204](https://github.com/LouisFernando1204)

---

**Note**: This benchmark suite is designed for educational and research purposes to help developers understand WebSocket performance characteristics across different implementations and make informed technology choices for their projects.
