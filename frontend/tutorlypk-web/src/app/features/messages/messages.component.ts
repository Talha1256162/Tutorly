import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Conversation } from '../../core/models/api.models';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [IconComponent, NavbarComponent],
  template: `
    <div class="min-h-screen relative pb-6">
      <app-navbar />
      <main class="pt-24 mx-auto max-w-7xl px-6">
        @if (selected) {
          <section class="glass-strong rounded-3xl shadow-card overflow-hidden h-[calc(100vh-9rem)] grid md:grid-cols-[300px_1fr]">
            <aside class="border-r border-white/5">
              <div class="p-5">
                <h1 class="font-display text-2xl font-semibold mb-4">Messages</h1>
                <div class="glass rounded-3xl px-4 py-3 flex items-center gap-2 text-muted-foreground"><app-icon name="search" className="h-4 w-4" />Search</div>
              </div>
              <div>
                @for (conversation of conversations; track conversation.id) {
                  <button (click)="selected = conversation" class="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/5" [class.bg-white/5]="selected.id === conversation.id">
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
                <div class="flex-1"><div class="font-display text-xl font-semibold flex items-center gap-2">{{ selected.personName }} <app-icon name="shield-check" className="h-4 w-4 text-success" /></div><div class="text-sm text-muted-foreground">{{ selected.status }}</div></div>
                <app-icon name="phone" className="h-5 w-5 text-muted-foreground" />
                <app-icon name="video" className="h-5 w-5 text-muted-foreground" />
                <app-icon name="ellipsis" className="h-5 w-5 text-muted-foreground" />
              </header>
              <div class="flex-1 overflow-auto p-8">
                <div class="text-center text-xs text-muted-foreground mb-8">Today</div>
                @for (message of selected.messages; track message.id) {
                  <div class="flex mb-4" [class.justify-end]="message.isMine">
                    <div class="max-w-lg rounded-3xl px-5 py-4" [class.bg-primary-gradient]="message.isMine" [class.text-primary-foreground]="message.isMine" [class.glass]="!message.isMine">
                      <div class="font-medium">{{ message.body }}</div>
                      <div class="text-xs mt-2 opacity-70">{{ message.time }}</div>
                    </div>
                  </div>
                }
                <div class="glass rounded-2xl px-5 py-3 inline-flex gap-1 text-muted-foreground"><span>•</span><span>•</span><span>•</span></div>
              </div>
              <footer class="px-6 pb-5">
                <div class="glass rounded-3xl px-5 py-3 flex items-center gap-4">
                  <app-icon name="paperclip" className="h-5 w-5 text-muted-foreground" />
                  <input class="flex-1 bg-transparent outline-none text-muted-foreground" placeholder="Type a message..." />
                  <app-icon name="message-circle" className="h-5 w-5 text-muted-foreground" />
                  <button class="h-10 w-10 rounded-full bg-primary-gradient grid place-items-center text-primary-foreground"><app-icon name="send" className="h-5 w-5" /></button>
                </div>
                <div class="flex justify-center items-center gap-2 text-xs text-muted-foreground mt-3"><app-icon name="shield-check" className="h-3.5 w-3.5 text-success" /> All chats are monitored for safety. Never share payment outside Lumora.</div>
              </footer>
            </section>
          </section>
        }
      </main>
    </div>
  `,
})
export class MessagesComponent implements OnInit {
  conversations: Conversation[] = [];
  selected?: Conversation;

  constructor(private readonly api: ApiService, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.api.conversations().subscribe(conversations => {
      this.conversations = conversations;
      this.selected = conversations[0];
      this.cdr.detectChanges();
    });
  }
}
