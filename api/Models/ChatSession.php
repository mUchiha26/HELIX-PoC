<?php
namespace App\Models;

use App\Config\Database;
use PDO;

class ChatSession
{
    public static function create(int $userId, string $role, string $content, ?int $alertId = null): int
    {
        $db = Database::getInstance();
        $stmt = $db->prepare(
            'INSERT INTO chat_sessions (user_id, message_role, content, alert_id)
             VALUES (:user_id, :message_role, :content, :alert_id)'
        );
        $stmt->execute([
            ':user_id'      => $userId,
            ':message_role' => $role,
            ':content'      => $content,
            ':alert_id'     => $alertId,
        ]);
        return (int) $db->lastInsertId();
    }

    public static function getHistory(int $userId, ?int $alertId = null, int $limit = 50): array
    {
        $db = Database::getInstance();

        if ($alertId !== null) {
            $stmt = $db->prepare(
                'SELECT * FROM chat_sessions
                 WHERE user_id = :user_id AND alert_id = :alert_id
                 ORDER BY sent_at ASC LIMIT :limit'
            );
            $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':alert_id', $alertId, PDO::PARAM_INT);
        } else {
            $stmt = $db->prepare(
                'SELECT * FROM chat_sessions
                 WHERE user_id = :user_id AND alert_id IS NULL
                 ORDER BY sent_at ASC LIMIT :limit'
            );
            $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        }

        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public static function countByUser(int $userId): int
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT COUNT(*) as count FROM chat_sessions WHERE user_id = ?');
        $stmt->execute([$userId]);
        return (int) $stmt->fetch()['count'];
    }
}
