import Markdown from '../shared/Markdown';

interface Props {
  message: { sender: string; contenu: string; createdAt: string };
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.sender === 'USER';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
        isUser ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-900'
      }`}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.contenu}</p>
        ) : (
          <Markdown>{message.contenu}</Markdown>
        )}
      </div>
    </div>
  );
}
