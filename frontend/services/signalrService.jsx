import * as signalR from '@microsoft/signalr';
import { API_BASE_URL } from '../src/config';

class SignalRService {
    constructor() {
        this.connection = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.listeners = new Map();
    }

    async connect(token) {
        if (this.connection && this.isConnected) {
            console.log('SignalR already connected');
            return;
        }

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5221';
            const hubUrl = `${apiUrl}/hubs/notifications`;


            this.connection = new signalR.HubConnectionBuilder()
                .withUrl('http://localhost:5221/hubs/notifications', {
                    accessTokenFactory: () => token,
                    skipNegotiation: false,
                    transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
                })
                .withAutomaticReconnect({
                    nextRetryDelayInMilliseconds: (retryContext) => {
                        if (retryContext.previousRetryCount < 5) {
                            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
                        }
                        return null; // Stop reconnecting after 5 attempts
                    }
                })
                .configureLogging(signalR.LogLevel.Information)
                .build();

            // Connection lifecycle events
            this.connection.onclose((error) => {
                console.log('SignalR connection closed', error);
                this.isConnected = false;
            });

            this.connection.onreconnecting((error) => {
                console.log('SignalR reconnecting...', error);
                this.isConnected = false;
            });

            this.connection.onreconnected((connectionId) => {
                console.log('SignalR reconnected. ConnectionId:', connectionId);
                this.isConnected = true;
                this.reconnectAttempts = 0;
            });

            // Start connection
            await this.connection.start();
            this.isConnected = true;
            console.log('SignalR Connected. ConnectionId:', this.connection.connectionId);

            // Restore event listeners after reconnection
            this.listeners.forEach((callback, event) => {
                this.connection.on(event, callback);
            });

        } catch (error) {
            console.error('Error connecting to SignalR:', error);
            this.isConnected = false;
            
            // Retry connection
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
                console.log(`Retrying connection in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                setTimeout(() => this.connect(token), delay);
            }
        }
    }

    disconnect() {
        if (this.connection) {
            this.connection.stop();
            this.isConnected = false;
            this.listeners.clear();
            console.log('SignalR disconnected');
        }
    }

    on(event, callback) {
        if (!this.connection) {
            console.warn('Cannot register event listener: SignalR not initialized');
            return;
        }

        this.listeners.set(event, callback);
        this.connection.on(event, callback);
    }

    off(event) {
        if (!this.connection) return;
        
        this.listeners.delete(event);
        this.connection.off(event);
    }

    async invoke(method, ...args) {
        if (!this.connection || !this.isConnected) {
            console.error('Cannot invoke method: SignalR not connected');
            return null;
        }

        try {
            return await this.connection.invoke(method, ...args);
        } catch (error) {
            console.error(`Error invoking ${method}:`, error);
            throw error;
        }
    }

    getConnectionState() {
        if (!this.connection) return 'Disconnected';
        return this.connection.state;
    }
}

// Singleton instance
const signalRService = new SignalRService();
export default signalRService;