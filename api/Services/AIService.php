<?php
namespace App\Services;

use App\Models\ChatSession;
use App\Config\Environment;
use OpenAI;

class AIService
{
    private const SYSTEM_PROMPT = <<<'PROMPT'
You are HELIX AI Assistant, a cybersecurity operations advisor integrated into the HELIX platform.
Provide concise, actionable guidance on security alerts, threat analysis, and remediation steps.
Always maintain a professional tone and prioritize accuracy over speculation.
If you are unsure, say so clearly.
PROMPT;

    public function chat(int $userId, string $message, ?int $alertId = null): array
    {
        $apiKey = Environment::get('OPENAI_API_KEY');

        if (!$apiKey) {
            return ['error' => 'AI service not configured', 'code' => 503];
        }

        ChatSession::create($userId, 'user', $message, $alertId);

        $history = ChatSession::getHistory($userId, $alertId, 20);

        $messages = [
            ['role' => 'system', 'content' => self::SYSTEM_PROMPT],
        ];

        foreach ($history as $msg) {
            $messages[] = [
                'role'    => $msg['message_role'],
                'content' => $msg['content'],
            ];
        }

        try {
            $baseUrl = Environment::get('OPENAI_BASE_URL', 'https://api.openai.com/v1');
            $model   = Environment::get('OPENAI_MODEL', 'gpt-4o-mini');

            $client = OpenAI::factory()
                ->withApiKey($apiKey)
                ->withBaseUri($baseUrl)
                ->make();

            $response = $client->chat()->create([
                'model'    => $model,
                'messages' => $messages,
            ]);

            $reply = $response->choices[0]->message->content ?? '';

            if ($reply === '') {
                return ['error' => 'Empty response from AI', 'code' => 502];
            }

            ChatSession::create($userId, 'assistant', $reply, $alertId);

            return ['response' => $reply];
        } catch (\Throwable $e) {
            return ['error' => 'AI request failed: ' . $e->getMessage(), 'code' => 502];
        }
    }

    public function history(int $userId, ?int $alertId = null): array
    {
        return ChatSession::getHistory($userId, $alertId, 50);
    }
}
