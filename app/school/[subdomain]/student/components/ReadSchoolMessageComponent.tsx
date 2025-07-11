"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { User, Users, Mail, Send, ArrowLeft, Star, Inbox, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";

interface Message {
  id: number;
  from: string;
  to: string;
  text: string;
  time: string;
}

const mockContacts = [
  { id: "t1", name: "Mr. Johnson", role: "Teacher", avatar: "🧑‍🏫" },
  { id: "t2", name: "Ms. Smith", role: "Teacher", avatar: "👩‍🏫" },
  { id: "a1", name: "School Admin", role: "Admin", avatar: "🏫" },
  { id: "s1", name: "Support Staff", role: "Staff", avatar: "🧑‍💼" },
];

const mockMessages: Record<string, Message[]> = {
  t1: [
    { id: 1, from: "t1", to: "student", text: "Hi! Please remember to submit your assignment by Friday.", time: "2h ago" },
    { id: 2, from: "student", to: "t1", text: "Thank you, I will!", time: "1h ago" },
  ],
  t2: [
    { id: 1, from: "t2", to: "student", text: "Parent-teacher meeting is next week.", time: "3d ago" },
  ],
  a1: [
    { id: 1, from: "a1", to: "student", text: "Welcome to the new term! Let us know if you need anything.", time: "5d ago" },
  ],
  s1: [
    { id: 1, from: "s1", to: "student", text: "Your library books are due next Monday.", time: "1d ago" },
  ],
};

export default function ReadSchoolMessageComponent({ onBack }: { onBack: () => void }) {
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);
  const [showContacts, setShowContacts] = useState(true);
  const [contactSearch, setContactSearch] = useState("");

  const handleSend = () => {
    if (!selectedContact || !messageInput.trim()) return;
    setMessages((prev) => ({
      ...prev,
      [selectedContact]: [
        ...(prev[selectedContact] || []),
        { id: Date.now(), from: "student", to: selectedContact, text: messageInput, time: "now" },
      ],
    }));
    setMessageInput("");
  };

  const filteredContacts = mockContacts.filter(contact =>
    contact.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    contact.role.toLowerCase().includes(contactSearch.toLowerCase())
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2 hover:bg-primary/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center rounded-xl shadow-lg">
            <Mail className="w-6 h-6 text-primary-foreground text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              School Messages
            </h1>
            <p className="text-sm text-muted-foreground/90 font-medium">
              Read and send messages to your teachers, admin, and staff
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-white/50 rounded-full border border-primary/10 shadow-sm">
          <Inbox className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground/80">
            {Object.values(messages).reduce((acc, arr) => acc + arr.length, 0)} messages
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Contacts Sidebar */}
        <div className="md:w-1/4 w-full">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-foreground">Contacts</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowContacts((v) => !v)}>
              {showContacts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
          {showContacts && (
            <>
              <Input
                placeholder="Search teacher or staff..."
                value={contactSearch}
                onChange={e => setContactSearch(e.target.value)}
                className="mb-3"
              />
              <div className="space-y-2">
                {filteredContacts.length === 0 ? (
                  <div className="text-muted-foreground text-sm px-2 py-4">No contacts found.</div>
                ) : (
                  filteredContacts.map((contact) => (
                    <Card
                      key={contact.id}
                      className={`flex items-center gap-3 p-3 cursor-pointer border-primary/20 hover:border-primary/40 transition-all ${selectedContact === contact.id ? "bg-primary/10 border-primary" : ""}`}
                      onClick={() => setSelectedContact(contact.id)}
                    >
                      <span className="text-2xl">{contact.avatar}</span>
                      <div>
                        <div className="font-semibold text-foreground">{contact.name}</div>
                        <div className="text-xs text-muted-foreground">{contact.role}</div>
                      </div>
                      {selectedContact === contact.id && <Badge className="ml-auto">Active</Badge>}
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Message Thread */}
        <div className="flex-1">
          {selectedContact ? (
            <Card className="h-full flex flex-col border-primary/20">
              <CardHeader className="flex flex-row items-center gap-3 border-b border-primary/10 pb-2">
                <span className="text-2xl">{mockContacts.find((c) => c.id === selectedContact)?.avatar}</span>
                <CardTitle className="text-lg font-semibold text-foreground">
                  {mockContacts.find((c) => c.id === selectedContact)?.name}
                </CardTitle>
                <Badge variant="secondary" className="ml-2">
                  {mockContacts.find((c) => c.id === selectedContact)?.role}
                </Badge>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto max-h-96 py-4 space-y-4">
                {(messages[selectedContact] || []).map((msg: Message) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.from === "student" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`rounded-lg px-4 py-2 max-w-xs shadow-sm ${
                        msg.from === "student"
                          ? "bg-primary text-white"
                          : "bg-card text-foreground border border-primary/10"
                      }`}
                    >
                      <div className="text-sm">{msg.text}</div>
                      <div className="text-xs text-muted-foreground mt-1 text-right">{msg.time}</div>
                    </div>
                  </div>
                ))}
                {(!messages[selectedContact] || messages[selectedContact].length === 0) && (
                  <div className="text-center text-muted-foreground">No messages yet. Start the conversation!</div>
                )}
              </CardContent>
              <div className="border-t border-primary/10 p-4 flex gap-2 bg-background">
                <Input
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                />
                <Button onClick={handleSend} className="bg-primary text-white" disabled={!messageInput.trim()}>
                  <Send className="w-4 h-4 mr-1" /> Send
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="flex items-center justify-center h-full min-h-[300px] border-primary/20">
              <CardContent className="flex flex-col items-center gap-4 py-12">
                <MessageCircle className="w-12 h-12 text-muted-foreground" />
                <div className="text-lg font-semibold text-foreground">Select a contact to start messaging</div>
                <div className="text-muted-foreground">You can message your teachers, admin, or staff here.</div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 