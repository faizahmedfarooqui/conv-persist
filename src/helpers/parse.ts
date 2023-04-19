
import { Role } from '../types/role';
import { Conversation } from '../types/conversation';

export const parse = (history: string): Conversation[] => {
  const lines = history.split('\n');
  const conversation: Conversation[] = [];

  let currentRole: Role | null = null;
  let currentContent = '';

  lines.forEach((line, index) => {
    let roleAndContent = line.split(': ');

    if (roleAndContent.length === 2) {
      const role = roleAndContent[0].toLowerCase() as Role;

      if (['system', 'assistant', 'user'].includes(role)) {
        if (currentRole) {
          conversation.push({ role: currentRole, content: currentContent.trim() });
          currentContent = '';
        }
        currentRole = role;
      }
    }

    if (currentRole) {
      currentContent += `${line}\n`;
    }

    if (index === lines.length - 1 && currentRole) {
      conversation.push({ role: currentRole, content: currentContent.trim() });
    }
  });

  return conversation;
};
