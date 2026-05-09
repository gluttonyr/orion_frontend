import { useState, useEffect } from "react";
import { Search, Send, MoreVertical, Check, CheckCheck } from "lucide-react";
import { discussionService } from "../service/discussion.service";
import { messageService } from "../service/message.service";
import { useUser } from "../lib/user-context.tsx";

interface ConversationItem {
  id: string;
  userName: string;
  avatar: string;
  unread: number;
  lastMessage: string;
  timestamp: string;
}

interface ChatMessage {
  id: string;
  conversationId: string;
  sender: "user" | "merchant";
  senderName: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
}

export function Messages() {
  const { user } = useUser();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationItem | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messagesList, setMessagesList] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const [discussionData, messageData] = await Promise.all([
          discussionService.getAll(),
          messageService.getAll(),
        ]);

        const formattedConversations = discussionData.map((discussion) => {
          const participant = discussion.participants?.find((participant) => participant.id !== user?.id) || discussion.participants?.[0];
          const lastMessage = messageData.filter((msg) => msg.discussionId === discussion.id).slice(-1)[0];

          return {
            id: discussion.id.toString(),
            userName: participant ? `${participant.prenom || ""} ${participant.nom || ""}`.trim() : `Conversation ${discussion.id}`,
            avatar: participant?.prenom?.charAt(0)?.toUpperCase() || "C",
            unread: 0,
            lastMessage: lastMessage?.contenu || "Aucun message",
            timestamp: lastMessage?.date_envoi
              ? new Date(lastMessage.date_envoi).toLocaleDateString("fr-FR")
              : "",
          };
        });

        const formattedMessages = messageData.map((message) => {
          const isOwn = user ? message.utilisateurId === user.id : false;
          return {
            id: message.id.toString(),
            conversationId: message.discussionId.toString(),
            sender: isOwn ? "user" : "merchant",
            senderName: isOwn ? "Vous" : "Interlocuteur",
            text: message.contenu,
            timestamp: message.date_envoi
              ? new Date(message.date_envoi).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
            isOwn,
          };
        });

        setConversations(formattedConversations);
        setMessagesList(formattedMessages);
        setSelectedConversation(formattedConversations[0] || null);
      } catch (error) {
        console.error("Erreur chargement des discussions :", error);
      }
    };

    loadMessages();
  }, [user]);

  const filteredConversations = conversations.filter((conv) =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const conversationMessages = selectedConversation
    ? messagesList.filter((msg) => msg.conversationId === selectedConversation.id)
    : [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim() && selectedConversation) {
      const newMessage = {
        id: Date.now().toString(),
        conversationId: selectedConversation.id,
        sender: "user" as const,
        senderName: "Vous",
        text: messageText,
        timestamp: "À l'instant",
        isOwn: true,
      };
      setMessagesList([...messagesList, newMessage]);
      setMessageText("");
    }
  };

  return (
    <div className="pb-20 md:pb-6">
      <div className="bg-white shadow-md border-4 border-gray-100 overflow-hidden h-[calc(100vh-180px)]">
        <div className="grid md:grid-cols-[350px_1fr] h-full">
          {/* Conversations List */}
          <div className="border-r-4 border-gray-200 flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b-4 border-gray-100 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Messages</h2>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une conversation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border-2 border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`w-full p-4 border-b-2 border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                    selectedConversation?.id === conversation.id ? "bg-gray-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gray-300 border-2 border-gray-300 flex items-center justify-center text-gray-700 font-semibold flex-shrink-0">
                        {conversation.avatar}
                      </div>
                      {conversation.unread > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-secondary border-2 border-white flex items-center justify-center text-white text-xs font-semibold">
                          {conversation.unread}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">{conversation.userName}</h4>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{conversation.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex flex-col bg-gray-50">
            {/* Chat Header */}
            <div className="p-4 border-b-4 border-gray-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 border-2 border-gray-300 flex items-center justify-center text-gray-700 font-semibold">
                  {selectedConversation?.avatar ?? "C"}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedConversation?.userName ?? "Aucune conversation"}</h3>
                  <p className="text-xs text-gray-500">En ligne</p>
                </div>
              </div>
              <button title="Options" className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {conversationMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[75%] ${message.isOwn ? "order-2" : "order-1"}`}>
                    <div
                      className={`px-4 py-2 shadow-sm ${
                        message.isOwn
                          ? "bg-primary text-white border-2 border-primary"
                          : "bg-white text-gray-900 border-2 border-gray-200"
                      }`}
                    >
                      <p className="break-words">{message.text}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${message.isOwn ? "text-blue-100" : "text-gray-500"}`}>
                        <span className="text-xs">{message.timestamp}</span>
                        {message.isOwn && (
                          <CheckCheck className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t-4 border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Écrivez votre message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <button
                  type="submit"
                  title="Envoyer un message"
                  disabled={!messageText.trim()}
                  className="w-12 h-12 bg-primary text-white hover:bg-blue-700 transition-colors flex items-center justify-center border-2 border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}