import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  HttpTransportType,
  LogLevel,
} from '@microsoft/signalr';
import { MessageItem } from '../models/api.models';
import { apiUrl } from '../api-endpoints';

export type ChatConnectionStatus = 'connecting' | 'live' | 'reconnecting' | 'offline';

export interface RealtimeChatMessage {
  conversationId: string;
  message: MessageItem;
}

@Injectable({ providedIn: 'root' })
export class ChatRealtimeService {
  private readonly hubUrl = apiUrl('/hubs/chat');
  private readonly messageSubject = new Subject<RealtimeChatMessage>();
  private readonly statusSubject = new BehaviorSubject<ChatConnectionStatus>('offline');
  private connection?: HubConnection;

  readonly messages$ = this.messageSubject.asObservable();
  readonly status$ = this.statusSubject.asObservable();

  get isConnected(): boolean {
    return this.connection?.state === HubConnectionState.Connected;
  }

  async connect(): Promise<void> {
    if (this.isConnected || this.connection?.state === HubConnectionState.Connecting) {
      return;
    }

    this.connection = new HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => localStorage.getItem('tutorly_access_token') ?? '',
        transport: HttpTransportType.WebSockets,
        skipNegotiation: true,
      })
      .configureLogging(LogLevel.Warning)
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .build();

    this.connection.on('MessageReceived', (conversationId: string, message: MessageItem) => {
      this.messageSubject.next({ conversationId, message });
    });
    this.connection.onreconnecting(() => this.statusSubject.next('reconnecting'));
    this.connection.onreconnected(() => this.statusSubject.next('live'));
    this.connection.onclose(() => this.statusSubject.next('offline'));

    this.statusSubject.next('connecting');
    try {
      await this.connection.start();
      this.statusSubject.next('live');
    } catch (error) {
      this.statusSubject.next('offline');
      throw error;
    }
  }

  async joinConversation(conversationId: string): Promise<void> {
    if (this.isConnected) {
      await this.connection!.invoke('JoinConversation', conversationId);
    }
  }

  async sendMessage(conversationId: string, body: string): Promise<MessageItem> {
    if (!this.isConnected) {
      throw new Error('Realtime chat is not connected.');
    }

    return this.connection!.invoke<MessageItem>('SendMessage', conversationId, body);
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = undefined;
      this.statusSubject.next('offline');
    }
  }
}
