import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ChatConnectionStatus, ChatRealtimeService } from '../../core/services/chat-realtime.service';
import { Conversation, MessageItem } from '../../core/models/api.models';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent, NavbarComponent],
  template: `
    <div class="min-h-screen relative pb-6">
      <app-navbar />
      <main class="pt-24 mx-auto max-w-7xl px-6">
        @if (isLoading) {
          <section class="glass-strong rounded-3xl shadow-card p-10 text-center text-muted-foreground">Loading conversations...</section>
        } @else if (selected) {
          <section class="glass-strong rounded-3xl shadow-card overflow-hidden h-[calc(100vh-9rem)] grid md:grid-cols-[300px_1fr]">
            <aside class="border-r border-white/5">
              <div class="p-5">
                <h1 class="font-display text-2xl font-semibold">{{ inboxTitle }}</h1>
                <p class="text-xs text-muted-foreground mt-1 mb-4">{{ inboxSubtitle }}</p>
                <label class="glass rounded-3xl px-4 py-3 flex items-center gap-2 text-muted-foreground">
                  <span class="sr-only">Search conversations</span>
                  <app-icon name="search" className="h-4 w-4" />
                  <input name="conversationSearch" [(ngModel)]="conversationSearch" class="flex-1 bg-transparent outline-none text-foreground" placeholder="Search" autocomplete="off" />
                </label>
              </div>
              <div>
                @for (conversation of filteredConversations; track conversation.id) {
                  <button type="button" (click)="selectConversation(conversation)" class="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/5" [class.bg-white/5]="selected.id === conversation.id">
                    <img [src]="conversation.photoUrl" [alt]="conversation.personName" class="h-12 w-12 rounded-full object-cover" />
                    <div class="min-w-0 flex-1"><div class="font-semibold truncate">{{ conversation.personName }}</div><div class="text-sm text-muted-foreground truncate">{{ conversation.lastMessage }}</div></div>
                    <div class="text-xs text-muted-foreground">{{ conversation.lastMessageTime }}</div>
                  </button>
                }
              </div>
            </aside>

            <section class="flex flex-col min-h-0">
              <header class="px-6 py-4 border-b border-white/5 flex items-center gap-4">
                <img [src]="selected.photoUrl" [alt]="selected.personName" class="h-12 w-12 rounded-full object-cover" />
                <div class="flex-1">
                  <div class="font-display text-xl font-semibold flex items-center gap-2">
                    {{ selected.personName }}
                    @if (selected.verified) { <app-icon name="shield-check" className="h-4 w-4 text-success" /> }
                  </div>
                  <div class="text-sm text-muted-foreground flex items-center gap-2">
                    {{ selected.status }}
                    <span class="h-1.5 w-1.5 rounded-full" [class.bg-success]="connectionStatus === 'live'" [class.bg-warning]="connectionStatus !== 'live'"></span>
                    <span [class.text-success]="connectionStatus === 'live'">{{ connectionLabel }}</span>
                  </div>
                </div>
                <button type="button" class="premium-icon-btn" disabled aria-label="Voice calls coming soon" title="Voice calls coming soon"><app-icon name="phone" className="h-5 w-5" /></button>
                <button type="button" class="premium-icon-btn" disabled aria-label="Video calls coming soon" title="Video calls coming soon"><app-icon name="video" className="h-5 w-5" /></button>
                <button type="button" class="premium-icon-btn" disabled aria-label="Conversation options coming soon" title="Conversation options coming soon"><app-icon name="ellipsis" className="h-5 w-5" /></button>
              </header>
              <div class="flex-1 overflow-auto p-8">
                @if (selected.messages.length === 0) {
                  <div class="text-center text-muted-foreground mt-16">{{ firstMessagePrompt }}</div>
                } @else {
                  <div class="text-center text-xs text-muted-foreground mb-8">Conversation</div>
                  @for (message of selected.messages; track message.id) {
                    <div class="flex mb-4" [class.justify-end]="message.isMine">
                      <div class="max-w-lg rounded-3xl px-5 py-4" [class.bg-primary-gradient]="message.isMine" [class.text-primary-foreground]="message.isMine" [class.glass]="!message.isMine">
                        <div class="font-medium">{{ message.body }}</div>
                        <div class="text-xs mt-2 opacity-70">{{ message.time }}</div>
                      </div>
                    </div>
                  }
                }
              </div>
              <footer class="px-6 pb-5">
                @if (errorMessage) {
                  <div class="mb-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{{ errorMessage }}</div>
                }
                <form (ngSubmit)="sendMessage()" class="glass rounded-3xl px-5 py-3 flex items-center gap-4">
                  <button type="button" class="premium-icon-btn" disabled aria-label="Attachments coming soon" title="Attachments coming soon"><app-icon name="paperclip" className="h-5 w-5" /></button>
                  <input name="message" [(ngModel)]="draftMessage" maxlength="2000" autocomplete="off" aria-label="Message body" class="flex-1 bg-transparent outline-none text-foreground" placeholder="Type a message..." />
                  <button type="submit" [disabled]="isSending || !draftMessage.trim()" class="h-10 w-10 rounded-full bg-primary-gradient grid place-items-center text-primary-foreground disabled:opacity-50" aria-label="Send message"><app-icon name="send" className="h-5 w-5" /></button>
                </form>
                <div class="flex justify-center items-center gap-2 text-xs text-muted-foreground mt-3"><app-icon name="shield-check" className="h-3.5 w-3.5 text-success" /> All chats are monitored for safety. Never share payment outside Mentora.</div>
              </footer>
            </section>
          </section>
        } @else {
          <section class="glass-strong rounded-3xl shadow-card p-14 text-center">
            <h1 class="font-display text-3xl font-semibold">{{ emptyInboxTitle }}</h1>
            <p class="text-muted-foreground mt-3">{{ emptyInboxDescription }}</p>
            @if (!isTutor) {
              <a routerLink="/tutors" class="mt-7 inline-flex rounded-xl bg-primary-gradient px-6 py-3 font-semibold text-primary-foreground shadow-glow">Browse tutors</a>
            }
          </section>
        }
      </main>
    </div>
  `,
})
export class MessagesComponent implements OnInit, OnDestroy {
  conversations: Conversation[] = [];
  selected?: Conversation;
  conversationSearch = '';
  draftMessage = '';
  errorMessage = '';
  isLoading = true;
  isSending = false;
  connectionStatus: ChatConnectionStatus = 'connecting';
  private refreshTimer?: number;
  private readonly subscriptions = new Subscription();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: ApiService,
    private readonly authService: AuthService,
    private readonly realtime: ChatRealtimeService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(this.realtime.status$.subscribe(status => {
      this.connectionStatus = status;
      if (status === 'live') {
        void this.joinConversations();
      }
      this.cdr.detectChanges();
    }));
    this.subscriptions.add(this.realtime.messages$.subscribe(({ conversationId, message }) => {
      this.addMessage(conversationId, message);
    }));
    void this.realtime.connect().catch(() => {
      this.connectionStatus = 'offline';
      this.cdr.detectChanges();
    });

    const tutorId = this.route.snapshot.queryParamMap.get('tutor');
    if (tutorId && !this.isTutor) {
      this.api.startConversation(tutorId).subscribe({
        next: conversation => this.loadConversations(conversation.id),
        error: () => {
          this.errorMessage = 'Could not start this conversation. Please try again.';
          this.loadConversations();
        },
      });
    } else {
      this.loadConversations();
    }

    this.refreshTimer = window.setInterval(() => this.loadConversations(this.selected?.id, false), 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer !== undefined) {
      window.clearInterval(this.refreshTimer);
    }
    this.subscriptions.unsubscribe();
    void this.realtime.disconnect();
  }

  selectConversation(conversation: Conversation): void {
    this.selected = conversation;
    this.errorMessage = '';
  }

  get connectionLabel(): string {
    switch (this.connectionStatus) {
      case 'live':
        return 'Live';
      case 'reconnecting':
        return 'Reconnecting';
      case 'connecting':
        return 'Connecting';
      default:
        return 'Offline fallback';
    }
  }

  get isTutor(): boolean {
    return this.authService.currentUser?.role === 'tutor';
  }

  get inboxTitle(): string {
    return this.isTutor ? 'Student Messages' : 'Teacher Messages';
  }

  get inboxSubtitle(): string {
    return this.isTutor ? 'Conversations with students and parents' : 'Chat with your selected teachers';
  }

  get firstMessagePrompt(): string {
    return this.isTutor ? 'Send a helpful reply to begin this conversation.' : 'Send the first message to introduce the learning goals.';
  }

  get emptyInboxTitle(): string {
    return this.isTutor ? 'No student conversations yet' : 'No teacher conversations yet';
  }

  get emptyInboxDescription(): string {
    return this.isTutor ? 'New student or parent enquiries will appear here.' : 'Choose a verified teacher and send a message to begin.';
  }

  get filteredConversations(): Conversation[] {
    const query = this.conversationSearch.trim().toLowerCase();
    if (!query) {
      return this.conversations;
    }

    return this.conversations.filter(conversation =>
      conversation.personName.toLowerCase().includes(query)
      || conversation.lastMessage.toLowerCase().includes(query));
  }

  async sendMessage(): Promise<void> {
    const body = this.draftMessage.trim();
    if (!this.selected || !body || this.isSending) {
      return;
    }

    const conversationId = this.selected.id;
    this.isSending = true;
    this.errorMessage = '';
    try {
      const message = this.realtime.isConnected
        ? await this.realtime.sendMessage(conversationId, body)
        : await firstValueFrom(this.api.sendMessage(conversationId, body));
      this.addMessage(conversationId, message);
      this.draftMessage = '';
      this.loadConversations(conversationId, false);
    } catch {
      this.errorMessage = 'Message could not be sent. Please retry.';
    } finally {
      this.isSending = false;
      this.cdr.detectChanges();
    }
  }

  private loadConversations(preferredId?: string, showLoader = true): void {
    if (showLoader) {
      this.isLoading = true;
    }

    this.api.conversations().subscribe({
      next: conversations => {
        this.conversations = conversations;
        this.selected = conversations.find(conversation => conversation.id === preferredId)
          ?? conversations.find(conversation => conversation.id === this.selected?.id)
          ?? conversations[0];
        this.errorMessage = '';
        this.isLoading = false;
        void this.joinConversations();
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Messages are temporarily unavailable. Please retry.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private async joinConversations(): Promise<void> {
    if (!this.realtime.isConnected) {
      return;
    }

    await Promise.all(this.conversations.map(conversation =>
      this.realtime.joinConversation(conversation.id).catch(() => undefined)));
  }

  private addMessage(conversationId: string, message: MessageItem): void {
    const existing = this.conversations.find(conversation => conversation.id === conversationId);
    if (!existing || existing.messages.some(item => item.id === message.id)) {
      return;
    }

    const updated = {
      ...existing,
      lastMessage: message.body,
      lastMessageTime: message.time,
      messages: [...existing.messages, message],
    };
    this.conversations = [updated, ...this.conversations.filter(conversation => conversation.id !== conversationId)];
    if (this.selected?.id === conversationId) {
      this.selected = updated;
    }
    this.cdr.detectChanges();
  }
}
