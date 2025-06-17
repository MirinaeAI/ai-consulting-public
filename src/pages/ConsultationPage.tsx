import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MessageSquare, Send, CornerDownLeft, Paperclip, Mic } from 'lucide-react';
import type { ChatMessage, Tool } from '../lib/types';
import { ChatMessageList } from '@/components/ui/chat-message-list';
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from '@/components/ui/chat-bubble';
import { ChatInput } from '@/components/ui/chat-input';
import { Button } from '@/components/ui/button';
import SubscriptionGate from '../components/SubscriptionGate';

const ConsultationPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: '안녕하세요! AI 툴 추천을 도와드리는 컨설턴트입니다. 어떤 목적으로 AI 툴을 찾고 계신가요?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [_recommendedTools, setRecommendedTools] = useState<Tool[]>([]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input
    };

    const currentInput = input;
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const formattedMessages = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      formattedMessages.push({
        role: 'user',
        content: currentInput
      });

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: formattedMessages }),
      });

      if (!response.ok) {
        throw new Error('API 호출 중 오류가 발생했습니다.');
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.message.content
      };

      setMessages(prev => [...prev, assistantMessage]);
      setRecommendedTools(data.tools || []);

      if (user) {
        const { data: consultation, error: consultationError } = await supabase
          .from('consultations')
          .insert([{
            user_id: user.id,
            purpose: currentInput,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (consultationError) throw consultationError;

        if (consultation && data.tools && data.tools.length > 0) {
          const recommendations = data.tools.map((tool: Tool, index: number) => ({
            consultation_id: consultation.id,
            tool_id: tool.id,
            order: index + 1
          }));

          const { error: recommendationError } = await supabase
            .from('recommendations')
            .insert(recommendations);

          if (recommendationError) throw recommendationError;

          setTimeout(() => {
            navigate(`/recommendations/${consultation.id}`);
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttachFile = () => {
    console.log("Attach file clicked");
  };

  const handleMicrophoneClick = () => {
    console.log("Microphone clicked");
  };

  return (
    <SubscriptionGate>
      <div className="min-h-screen bg-gray-50 py-12 flex flex-col">
        <div className="container mx-auto px-4 flex-grow flex flex-col">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg flex flex-col flex-grow w-full">

            <div className="flex-grow overflow-hidden">
              <ChatMessageList smooth>
                {messages.map(message => (
                  <ChatBubble
                    key={message.id}
                    variant={message.type === 'user' ? 'sent' : 'received'}
                  >
                    <ChatBubbleAvatar
                      className="h-8 w-8 shrink-0"
                      src={message.type === 'user' ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&q=80&crop=faces&fit=crop" : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&q=80&crop=faces&fit=crop"}
                      fallback={message.type === 'user' ? (user?.email?.substring(0, 2)?.toUpperCase() || 'ME') : 'AI'}
                    />
                    <ChatBubbleMessage
                      variant={message.type === 'user' ? 'sent' : 'received'}
                    >
                      {message.content}
                    </ChatBubbleMessage>
                  </ChatBubble>
                ))}
                {isLoading && (
                  <ChatBubble variant="received">
                    <ChatBubbleAvatar
                      className="h-8 w-8 shrink-0"
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&q=80&crop=faces&fit=crop"
                      fallback="AI"
                    />
                    <ChatBubbleMessage isLoading />
                  </ChatBubble>
                )}
              </ChatMessageList>
            </div>

            <div className="p-4 border-t bg-white">
              <form
                onSubmit={handleSend}
                className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
              >
                <ChatInput
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="메시지를 입력하세요..."
                  className="min-h-[44px] resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0 pr-20 md:pr-28"
                  disabled={isLoading}
                />
                <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center p-1.5 pt-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={handleAttachFile}
                    disabled={isLoading}
                    className="hidden md:inline-flex text-gray-500 hover:text-gray-700 mr-1"
                    aria-label="Attach file"
                  >
                    <Paperclip className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={handleMicrophoneClick}
                    disabled={isLoading}
                    className="hidden md:inline-flex text-gray-500 hover:text-gray-700 mr-1"
                    aria-label="Use microphone"
                  >
                    <Mic className="size-4" />
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 h-8 px-3"
                    disabled={isLoading || !input.trim()}
                    aria-label="Send message"
                  >
                    <Send className="size-3.5 md:hidden" />
                    <span className="hidden md:inline">전송</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </SubscriptionGate>
  );
};

export default ConsultationPage;