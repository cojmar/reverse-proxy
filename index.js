// Importing necessary modules
import net from 'net'
import dgram from 'dgram'

// Defining ports and host

const IN_PORTS = process.argv[3]?.split(',') || [444]
const OUT_PORTS = process.argv[4]?.split(',') || [445]

const HOST = process.argv[5] || 'localhost'
const OUT_HOST = process.argv[6] || HOST

// Creating a UDP server
const udpServers = IN_PORTS.map(port => {
    const server = dgram.createSocket('udp4')
    server.bind(port)
    return server
})

// Creating a TCP server
const tcpServers = IN_PORTS.map(port => {
    const server = net.createServer()
    server.listen(port)
    return server
})

// Handling UDP server messages
udpServers.forEach((server, index) => {
    server.on('message', (msg, rinfo) => {
        console.log(`UDP server ${index} got: ${msg} from ${rinfo.address}:${rinfo.port}`)
        udpServers[index].send(msg, OUT_PORTS[index], OUT_HOST)
    })
})

// Handling TCP server connections
tcpServers.forEach((server, index) => {
    server.on('connection', (socket) => {
        // Handling TCP server data
        socket.on('data', (data) => {
            console.log(`TCP server ${index} got: ${data}`)
            // Creating a TCP client
            const client = net.createConnection({ port: OUT_PORTS[index], host: OUT_HOST })
            client.write(data)
            // Handling TCP client data
            client.on('data', (data) => {
                console.log(`TCP client ${index} got: ${data}`)
                socket.write(data)
            })
        })
    })
    console.log(`Redirect on ${HOST} to ${OUT_HOST} from port ${IN_PORTS[index]} to ${OUT_PORTS[index]} on both TCP and UDP Started!`)

})
console.log('---Usage---')
console.log('npm start <in_ports> <out_ports> <host> <out_host>')
console.log('---Single port---')
console.log(`simple example : npm start 80 8080`)
console.log(`full example : npm start 80 8080 127.0.0.1 127.0.0.1`)
console.log('---Multiple ports---')
console.log(`simple example : npm start 80,81 8080,8081`)
console.log(`full example : npm start 80,81 8080,8081 127.0.0.1 127.0.0.1`)

