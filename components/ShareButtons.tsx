'use client';

import { MessageCircle, MessageSquare } from "lucide-react";
import { formatGroupForSharing } from "@/lib/utils";
import { Participant } from "@/lib/types";

interface ShareButtonsProps {
    groupName: string;
    leader: string;
    participants: Participant[];
}

export function ShareButtons({ groupName, leader, participants }: ShareButtonsProps) {
    const handleWhatsAppShare = () => {
        const message = formatGroupForSharing(groupName, leader, participants);
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleSMSShare = () => {
        const message = formatGroupForSharing(groupName, leader, participants);
        const encodedMessage = encodeURIComponent(message);
        const smsUrl = `sms:?body=${encodedMessage}`;
        window.open(smsUrl, '_blank');
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleWhatsAppShare}
                className="flex items-center gap-1.5 rounded-md bg-green-100 px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50 transition-colors"
                title="Partager via WhatsApp"
            >
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
                onClick={handleSMSShare}
                className="flex items-center gap-1.5 rounded-md bg-blue-100 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors"
                title="Partager via SMS"
            >
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">SMS</span>
            </button>
        </div>
    );
}
